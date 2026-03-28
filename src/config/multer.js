const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { carouselStorage, pdfStorage } = require('./cloudinary');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const generateFilename = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return `${timestamp}-${random}${ext}`;
};

// Carousel: JPG, PNG, WEBP — max 2MB — stored in Cloudinary
const fileFilterCarousel = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Solo se permiten imagenes JPG, PNG o WEBP'));
  }
};

const uploadCarousel = multer({
  storage: carouselStorage,
  fileFilter: fileFilterCarousel,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// PDF: solo PDF — max 10MB — stored in Cloudinary
const fileFilterPDF = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Solo se permiten archivos PDF'));
  }
};

const uploadPDF = multer({
  storage: pdfStorage,
  fileFilter: fileFilterPDF,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// CV: PDF, DOC, DOCX — max 5MB — disk storage (unchanged)
const storageCV = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'cvs');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFilename(file));
  },
});

const fileFilterCV = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Solo se permiten archivos PDF, DOC o DOCX'));
  }
};

const uploadCV = multer({
  storage: storageCV,
  fileFilter: fileFilterCV,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadCarousel, uploadPDF, uploadCV };
