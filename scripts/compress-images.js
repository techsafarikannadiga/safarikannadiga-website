/**
 * Image Compression Script for SafariKannadiga
 * =============================================
 * 
 * Compresses large images in the public/images folder to optimize 
 * page load performance. Uses Sharp for high-quality compression.
 * 
 * Usage: node scripts/compress-images.js
 * 
 * @author Samarth V (samarthv.me)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    // Maximum dimensions
    maxWidth: 1920,
    maxHeight: 1200,
    
    // JPEG quality (1-100, 85 is a good balance)
    quality: 85,
    
    // Size threshold - only compress files larger than this (in bytes)
    sizeThreshold: 500 * 1024, // 500KB
    
    // Directories to process
    directories: [
        'public/images/hero-uploads',
        'public/images'
    ],
    
    // Files to process (in root public/images)
    specificFiles: [
        'about-hero.jpg',
        'about-story.jpg',
        'placeholder-safari.jpg',
        'why-choose-us.jpg',
        'hero-main.jpg'
    ]
};

// Create backup directory
const backupDir = path.join(process.cwd(), 'public/images/originals-backup');

async function ensureBackupDir() {
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
        console.log('📁 Created backup directory:', backupDir);
    }
}

async function compressImage(inputPath, outputPath) {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    
    // Skip if already small enough
    if (originalSize < CONFIG.sizeThreshold) {
        console.log(`⏭️  Skipping ${path.basename(inputPath)} (already ${(originalSize / 1024).toFixed(0)}KB)`);
        return { skipped: true, originalSize };
    }
    
    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        
        // Backup original
        const backupPath = path.join(backupDir, path.basename(inputPath));
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(inputPath, backupPath);
            console.log(`💾 Backed up: ${path.basename(inputPath)}`);
        }
        
        // Resize and compress
        let pipeline = image;
        
        if ((metadata.width && metadata.width > CONFIG.maxWidth) ||
            (metadata.height && metadata.height > CONFIG.maxHeight)) {
            pipeline = pipeline.resize(CONFIG.maxWidth, CONFIG.maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        
        await pipeline
            .jpeg({ quality: CONFIG.quality, mozjpeg: true })
            .toFile(outputPath + '.tmp');
        
        // Replace original with compressed version
        fs.renameSync(outputPath + '.tmp', outputPath);
        
        const newStats = fs.statSync(outputPath);
        const newSize = newStats.size;
        const savedBytes = originalSize - newSize;
        const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);
        
        console.log(`✅ ${path.basename(inputPath)}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024 / 1024).toFixed(2)}MB (saved ${savedPercent}%)`);
        
        return { 
            skipped: false, 
            originalSize, 
            newSize, 
            savedBytes 
        };
    } catch (error) {
        console.error(`❌ Error compressing ${inputPath}:`, error.message);
        return { error: true, originalSize };
    }
}

async function processDirectory(dirPath) {
    const fullPath = path.join(process.cwd(), dirPath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Directory not found: ${dirPath}`);
        return [];
    }
    
    const files = fs.readdirSync(fullPath);
    const results = [];
    
    for (const file of files) {
        const filePath = path.join(fullPath, file);
        const stat = fs.statSync(filePath);
        
        // Skip directories and non-image files
        if (stat.isDirectory()) continue;
        if (!/\.(jpg|jpeg|png)$/i.test(file)) continue;
        
        const result = await compressImage(filePath, filePath);
        results.push({ file, ...result });
    }
    
    return results;
}

async function processSpecificFiles() {
    const results = [];
    const baseDir = path.join(process.cwd(), 'public/images');
    
    for (const file of CONFIG.specificFiles) {
        const filePath = path.join(baseDir, file);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${file}`);
            continue;
        }
        
        const result = await compressImage(filePath, filePath);
        results.push({ file, ...result });
    }
    
    return results;
}

async function main() {
    console.log('🖼️  SafariKannadiga Image Compression Script');
    console.log('============================================\n');
    
    await ensureBackupDir();
    
    let totalOriginal = 0;
    let totalNew = 0;
    let filesCompressed = 0;
    
    // Process hero images
    console.log('\n📸 Processing hero images...');
    const heroResults = await processDirectory('public/images/hero-uploads');
    
    // Process specific large files
    console.log('\n📸 Processing other large images...');
    const specificResults = await processSpecificFiles();
    
    // Calculate totals
    const allResults = [...heroResults, ...specificResults];
    
    for (const result of allResults) {
        if (!result.skipped && !result.error) {
            totalOriginal += result.originalSize;
            totalNew += result.newSize;
            filesCompressed++;
        }
    }
    
    // Summary
    console.log('\n============================================');
    console.log('📊 COMPRESSION SUMMARY');
    console.log('============================================');
    console.log(`Files compressed: ${filesCompressed}`);
    console.log(`Original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`New size: ${(totalNew / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total saved: ${((totalOriginal - totalNew) / 1024 / 1024).toFixed(2)} MB (${totalOriginal > 0 ? (((totalOriginal - totalNew) / totalOriginal) * 100).toFixed(1) : 0}%)`);
    console.log(`\n💾 Original files backed up to: public/images/originals-backup/`);
    console.log('\n✨ Done!');
}

main().catch(console.error);
