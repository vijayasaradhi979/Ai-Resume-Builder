const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/resume_builder', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB successfully');
}).catch((error) => {
    console.error('❌ MongoDB connection error:', error);
});

// MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB Connected Successfully');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB Connection Error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('❌ MongoDB Disconnected');
});

// User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    codeExpiry: { type: Date },
    createdAt: { type: Date, default: Date.now },
    resumes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resume' }]
});

const User = mongoose.model('User', UserSchema);

// Resume Schema
const ResumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    templateId: { type: Number, required: true },
    content: {
        personalInfo: {
            fullName: String,
            email: String,
            phone: String,
            address: String,
            linkedin: String,
            website: String
        },
        summary: String,
        experience: [{
            company: String,
            position: String,
            startDate: String,
            endDate: String,
            description: String,
            achievements: [String]
        }],
        education: [{
            institution: String,
            degree: String,
            field: String,
            graduationDate: String,
            gpa: String
        }],
        skills: {
            technical: [String],
            soft: [String],
            languages: [String]
        },
        projects: [{
            name: String,
            description: String,
            technologies: [String],
            link: String
        }]
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Resume = mongoose.model('Resume', ResumeSchema);

// Email Configuration - WITH YOUR CREDENTIALS
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '', // Enter Your Mail
        pass: ''  // Enter Pass Key
    },
    debug: true,
    logger: true
});

// Test email configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send emails');
    }
});

// Helper Functions
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, code) {
    console.log(`📧 Attempting to send email to: ${email}`);
    console.log(`🔢 Verification code: ${code}`);
    
    const mailOptions = {
        from: {
            name: 'AI Resume Builder',
            address: 'vijayasaradhikyatham939@gmail.com'
        },
        to: email,
        subject: 'AI Resume Builder - Email Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a2e;">
                <div style="background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🚀 AI Resume Builder</h1>
                    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Email Verification Required</p>
                </div>
                
                <div style="background: #2d3748; padding: 40px; border-radius: 15px; border: 1px solid #4a5568;">
                    <h2 style="color: #ffffff; text-align: center; margin-bottom: 25px; font-size: 24px;">Verify Your Email Address</h2>
                    
                    <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
                        Welcome to AI Resume Builder! Please use the verification code below to complete your registration and start creating professional resumes.
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%); margin: 30px auto; padding: 30px; border-radius: 15px; text-align: center; max-width: 280px; box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);">
                        <p style="color: white; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
                        <h1 style="color: white; margin: 0; font-size: 48px; letter-spacing: 8px; font-family: 'Courier New', monospace; font-weight: bold;">
                            ${code}
                        </h1>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0; padding: 20px; background: rgba(0, 212, 255, 0.1); border-radius: 10px; border: 1px solid rgba(0, 212, 255, 0.3);">
                        <p style="color: #00d4ff; font-size: 14px; margin: 5px 0;">
                            ⏰ <strong>Expires in 15 minutes</strong>
                        </p>
                        <p style="color: #cbd5e1; font-size: 14px; margin: 5px 0;">
                            📧 Sent to: <strong>${email}</strong>
                        </p>
                        <p style="color: #06d6a0; font-size: 14px; margin: 5px 0;">
                            🔐 <strong>Keep this code secure and don't share it</strong>
                        </p>
                    </div>
                    
                    <div style="background: #374151; padding: 20px; border-radius: 10px; margin-top: 30px;">
                        <h3 style="color: #00d4ff; margin: 0 0 15px 0; font-size: 16px;">Next Steps:</h3>
                        <ol style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                            <li>Copy the 6-digit code above</li>
                            <li>Return to the AI Resume Builder website</li>
                            <li>Paste the code in the verification field</li>
                            <li>Click "Verify" to activate your account</li>
                            <li>Start building your professional resume!</li>
                        </ol>
                    </div>
                    
                    <div style="border-top: 1px solid #4a5568; margin-top: 30px; padding-top: 20px;">
                        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
                            If you didn't create an account with AI Resume Builder, please ignore this email. 
                            Your email address will not be added to any mailing lists.
                        </p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">
                        © 2025 AI Resume Builder - Create Professional Resumes with AI Power
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">
                        🌐 Hyderabad | 📧 vijayasaradhikyatham939@gmail.com
                    </p>
                </div>
            </div>
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('📨 Message ID:', info.messageId);
        console.log('📧 Recipient:', email);
        console.log('🕒 Sent at:', new Date().toLocaleString());
        return true;
    } catch (error) {
        console.error('❌ Email send error:', error.message);
        console.error('🔍 Full error details:', error);
        return false;
    }
}

// API Routes

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
    try {
        const { email } = req.body || { email: 'vijayasaradhikyatham939@gmail.com' };
        const testCode = '123456';
        
        console.log(`🧪 Testing email send to: ${email}`);
        const success = await sendVerificationEmail(email, testCode);
        
        if (success) {
            res.json({ 
                success: true, 
                message: 'Test email sent successfully! Check your inbox.',
                email: email,
                code: testCode
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Failed to send test email. Check server logs for details.' 
            });
        }
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Email test error', 
            error: error.message 
        });
    }
});

// User Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        console.log(`👤 Signup attempt for: ${email}`);
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }
        
        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(400).json({ message: 'User already exists and is verified. Please login.' });
            } else {
                // User exists but not verified, resend verification
                const verificationCode = generateVerificationCode();
                const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
                
                existingUser.verificationCode = verificationCode;
                existingUser.codeExpiry = codeExpiry;
                await existingUser.save();
                
                const emailSent = await sendVerificationEmail(email, verificationCode);
                
                if (emailSent) {
                    return res.status(200).json({ 
                        message: 'Verification email resent. Please check your inbox.',
                        userId: existingUser._id 
                    });
                } else {
                    return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
                }
            }
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Generate verification code
        const verificationCode = generateVerificationCode();
        const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        
        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            verificationCode,
            codeExpiry
        });
        
        await user.save();
        console.log(`✅ User created successfully: ${email}`);
        
        // Send verification email
        const emailSent = await sendVerificationEmail(email, verificationCode);
        
        if (emailSent) {
            res.status(201).json({ 
                success: true,
                message: 'Account created successfully! Verification email sent to your inbox.',
                userId: user._id,
                email: email
            });
        } else {
            // Delete user if email failed to send
            await User.findByIdAndDelete(user._id);
            res.status(500).json({ 
                success: false,
                message: 'Account creation failed. Unable to send verification email. Please try again.' 
            });
        }
        
    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during signup', 
            error: error.message 
        });
    }
});

// Email Verification
app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        console.log(`🔍 Verification attempt for: ${email} with code: ${code}`);
        
        if (!email || !code) {
            return res.status(400).json({ message: 'Email and verification code are required' });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please signup first.' });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ message: 'Account already verified. Please login.' });
        }
        
        if (user.verificationCode !== code.trim()) {
            return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
        }
        
        if (user.codeExpiry < new Date()) {
            return res.status(400).json({ message: 'Verification code expired. Please request a new one.' });
        }
        
        // Verify user
        user.isVerified = true;
        user.verificationCode = undefined;
        user.codeExpiry = undefined;
        await user.save();
        
        console.log(`✅ User verified successfully: ${email}`);
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id }, 
            'ai_resume_builder_secret_key_2025', 
            { expiresIn: '24h' }
        );
        
        res.json({ 
            success: true,
            message: 'Email verified successfully! Welcome to AI Resume Builder!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });
        
    } catch (error) {
        console.error('❌ Verification error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during verification', 
            error: error.message 
        });
    }
});

// Resend Verification Code
app.post('/api/auth/resend-code', async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log(`🔄 Resend code request for: ${email}`);
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please signup first.' });
        }
        
        if (user.isVerified) {
            return res.status(400).json({ message: 'Account already verified. Please login.' });
        }
        
        // Generate new verification code
        const verificationCode = generateVerificationCode();
        const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        
        user.verificationCode = verificationCode;
        user.codeExpiry = codeExpiry;
        await user.save();
        
        // Send new verification email
        const emailSent = await sendVerificationEmail(email, verificationCode);
        
        if (emailSent) {
            res.json({ 
                success: true,
                message: 'New verification code sent successfully! Check your inbox.' 
            });
        } else {
            res.status(500).json({ 
                success: false,
                message: 'Failed to send verification email. Please try again.' 
            });
        }
        
    } catch (error) {
        console.error('❌ Resend code error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while resending code', 
            error: error.message 
        });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log(`🔐 Login attempt for: ${email}`);
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        if (!user.isVerified) {
            return res.status(400).json({ 
                message: 'Please verify your email before logging in. Check your inbox for verification code.',
                needsVerification: true,
                email: email
            });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id }, 
            'ai_resume_builder_secret_key_2025', 
            { expiresIn: '24h' }
        );
        
        console.log(`✅ Login successful for: ${email}`);
        
        res.json({
            success: true,
            message: 'Login successful! Welcome back!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login', 
            error: error.message 
        });
    }
});

// Auth Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided, access denied' });
        }
        
        const decoded = jwt.verify(token, 'ai_resume_builder_secret_key_2025');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token, access denied' });
    }
};

// Get Templates
app.get('/api/templates', (req, res) => {
    const templates = [
        {
            id: 1,
            name: "Modern Professional",
            category: "Professional",
            description: "Clean and modern design perfect for corporate roles",
            color: "#00d4ff",
            popularityRating: 4.8,
            downloads: 15420
        },
        {
            id: 2,
            name: "Creative Designer",
            category: "Creative",
            description: "Bold and artistic template for creative professionals",
            color: "#7c3aed",
            popularityRating: 4.7,
            downloads: 12330
        },
        {
            id: 3,
            name: "Corporate Executive",
            category: "Executive",
            description: "Sophisticated template for senior-level positions",
            color: "#6b7280",
            popularityRating: 4.9,
            downloads: 18750
        },
        {
            id: 4,
            name: "Tech Specialist",
            category: "Technology",
            description: "Modern template optimized for tech professionals",
            color: "#06d6a0",
            popularityRating: 4.6,
            downloads: 9870
        },
        {
            id: 5,
            name: "Minimalist",
            category: "Simple",
            description: "Clean and simple design that lets content shine",
            color: "#64748b",
            popularityRating: 4.5,
            downloads: 11200
        },
        {
            id: 6,
            name: "Academic Researcher",
            category: "Academic",
            description: "Formal layout perfect for academic and research positions",
            color: "#0891b2",
            popularityRating: 4.4,
            downloads: 6540
        },
        {
            id: 7,
            name: "Startup Founder",
            category: "Entrepreneurial",
            description: "Dynamic template for entrepreneurs and startup founders",
            color: "#f59e0b",
            popularityRating: 4.7,
            downloads: 8930
        },
        {
            id: 8,
            name: "Healthcare Professional",
            category: "Healthcare",
            description: "Professional template for medical and healthcare careers",
            color: "#3b82f6",
            popularityRating: 4.6,
            downloads: 7650
        }
    ];
    
    res.json({ success: true, templates });
});

// Create Resume
app.post('/api/resume/create', auth, async (req, res) => {
    try {
        const { templateId, content } = req.body;
        
        if (!templateId || !content) {
            return res.status(400).json({ message: 'Template ID and content are required' });
        }
        
        const resume = new Resume({
            userId: req.user.userId,
            templateId,
            content
        });
        
        await resume.save();
        
        // Add resume to user's resumes array
        await User.findByIdAndUpdate(req.user.userId, {
            $push: { resumes: resume._id }
        });
        
        console.log(`📄 Resume created for user: ${req.user.userId}`);
        
        res.status(201).json({ 
            success: true,
            message: 'Resume created successfully',
            resumeId: resume._id 
        });
        
    } catch (error) {
        console.error('❌ Resume creation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while creating resume', 
            error: error.message 
        });
    }
});

// Get User Resumes
app.get('/api/resume/list', auth, async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.user.userId })
                                  .sort({ updatedAt: -1 });
        
        res.json({ 
            success: true,
            resumes,
            count: resumes.length 
        });
    } catch (error) {
        console.error('❌ Get resumes error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching resumes', 
            error: error.message 
        });
    }
});

// Update Resume
app.put('/api/resume/:id', auth, async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ message: 'Resume content is required' });
        }
        
        const resume = await Resume.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { content, updatedAt: new Date() },
            { new: true }
        );
        
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found or access denied' });
        }
        
        console.log(`📝 Resume updated: ${req.params.id}`);
        
        res.json({ 
            success: true,
            message: 'Resume updated successfully', 
            resume 
        });
        
    } catch (error) {
        console.error('❌ Resume update error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while updating resume', 
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        message: 'AI Resume Builder API is healthy!',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true,
        message: 'AI Resume Builder API is working perfectly!',
        endpoints: [
            'POST /api/auth/signup',
            'POST /api/auth/verify-email',
            'POST /api/auth/login',
            'POST /api/auth/resend-code',
            'POST /api/test-email',
            'GET /api/templates',
            'POST /api/resume/create',
            'GET /api/resume/list',
            'PUT /api/resume/:id'
        ]
    });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: [
            'GET /',
            'GET /api/test',
            'GET /api/health',
            'POST /api/auth/signup',
            'POST /api/auth/verify-email',
            'POST /api/auth/login'
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 =================================');
    console.log('   AI RESUME BUILDER SERVER');
    console.log('🚀 =================================');
    console.log(`📱 Server: http://localhost:${PORT}`);
    console.log(`📧 Email: vijayasaradhikyatham939@gmail.com`);
    console.log(`🗄️  Database: resume_builder`);
    console.log(`🕒 Started: ${new Date().toLocaleString()}`);
    console.log('🚀 =================================\n');
});