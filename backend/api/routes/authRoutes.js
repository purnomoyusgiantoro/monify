const express = require('express');
const bcrypt = require('bcryptjs');
const { generateId, now } = require('../data/db'); // generateId, now masih dipakai
const { authMiddleware, generateToken } = require('../middleware/authMiddleware');
const supabase = require('../supabase');

const router = express.Router();

// ============================================
// POST /api/auth/register — Daftar user baru
// ============================================
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
        }

        // Cek email sudah terdaftar
        const { data: existing, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existing) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            id: generateId(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            created_at: now(),
            update_at: now()
        };

        const { error: insertError } = await supabase
            .from('users')
            .insert([newUser]);

        if (insertError) {
            throw insertError;
        }

        // Generate token
        const token = generateToken(newUser);

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil.',
            data: {
                user: { id: newUser.id, name: newUser.name, email: newUser.email, created_at: newUser.created_at },
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// ============================================
// POST /api/auth/login — Login user
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
        }

        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (fetchError || !user) {
            return res.status(401).json({ success: false, message: 'Email atau password salah.' });
        }

        // Cek password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Email atau password salah.' });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login berhasil.',
            data: {
                user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// ============================================
// POST /api/auth/logout — Logout (client-side)
// ============================================
router.post('/logout', authMiddleware, (req, res) => {
    res.json({ success: true, message: 'Logout berhasil. Hapus token di client.' });
});

// ============================================
// GET /api/auth/me — Get current user info
// ============================================
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, created_at, update_at')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// ============================================
// PUT /api/auth/profile — Update profil user
// ============================================
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, email } = req.body;
        
        let updates = { update_at: now() };
        if (name) updates.name = name.trim();
        if (email) updates.email = email.toLowerCase().trim();

        if (email) {
            // Cek duplikat email
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', email.toLowerCase())
                .neq('id', req.user.id)
                .single();

            if (existing) {
                return res.status(400).json({ success: false, message: 'Email sudah digunakan user lain.' });
            }
        }

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.user.id)
            .select('id, name, email, update_at')
            .single();

        if (error || !updatedUser) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan atau gagal diupdate.' });
        }

        res.json({
            success: true,
            message: 'Profil berhasil diperbarui.',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error.message);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

// ============================================
// PUT /api/auth/password — Update password
// ============================================
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
        }

        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('password')
            .eq('id', req.user.id)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        // Verifikasi password lama
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Password lama tidak cocok.' });
        }

        // Hash password baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword, update_at: now() })
            .eq('id', req.user.id);

        if (updateError) {
            throw updateError;
        }

        res.json({ success: true, message: 'Password berhasil diperbarui.' });
    } catch (error) {
        console.error('Update password error:', error.message);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
});

module.exports = router;
