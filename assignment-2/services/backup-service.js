const fs = require('fs').promises;
const path = require('path');

class BackupService {
    constructor() {
        this.dataDir = path.join(__dirname, '../data');
        this.backupDir = path.join(__dirname, '../backups');
        this.dataFiles = ['products.json', 'users.json', 'orders.json', 'cart.json', 'prices.json', 'analytics.json'];
    }

    async ensureDirectories() {
        try {
            await fs.access(this.dataDir);
        } catch {
            await fs.mkdir(this.dataDir, { recursive: true });
        }

        try {
            await fs.access(this.backupDir);
        } catch {
            await fs.mkdir(this.backupDir, { recursive: true });
        }
    }

    async createBackup(type = 'manual') {
        await this.ensureDirectories();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFolder = path.join(this.backupDir, `backup-${type}-${timestamp}`);
        
        await fs.mkdir(backupFolder, { recursive: true });
        
        const backupPromises = this.dataFiles.map(async (file) => {
            try {
                const sourcePath = path.join(__dirname, '..', file);
                const targetPath = path.join(backupFolder, file);
                await fs.copyFile(sourcePath, targetPath);
                return { file, status: 'success' };
            } catch (error) {
                return { file, status: 'error', error: error.message };
            }
        });
        
        const results = await Promise.all(backupPromises);
        
        // Create backup manifest
        const manifest = {
            timestamp: new Date().toISOString(),
            type,
            files: results,
            totalFiles: this.dataFiles.length,
            successCount: results.filter(r => r.status === 'success').length
        };
        
        await fs.writeFile(
            path.join(backupFolder, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        
        return {
            backupPath: backupFolder,
            manifest
        };
    }

    async restoreFromBackup(backupPath) {
        try {
            const manifestPath = path.join(backupPath, 'manifest.json');
            const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
            
            const restorePromises = this.dataFiles.map(async (file) => {
                try {
                    const backupFilePath = path.join(backupPath, file);
                    const targetPath = path.join(__dirname, '..', file);
                    await fs.copyFile(backupFilePath, targetPath);
                    return { file, status: 'success' };
                } catch (error) {
                    return { file, status: 'error', error: error.message };
                }
            });
            
            const results = await Promise.all(restorePromises);
            
            return {
                success: true,
                manifest,
                restoreResults: results
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async listBackups() {
        await this.ensureDirectories();
        
        try {
            const backupFolders = await fs.readdir(this.backupDir);
            const backups = [];
            
            for (const folder of backupFolders) {
                if (folder.startsWith('backup-')) {
                    try {
                        const manifestPath = path.join(this.backupDir, folder, 'manifest.json');
                        const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
                        backups.push({
                            id: folder,
                            path: path.join(this.backupDir, folder),
                            ...manifest
                        });
                    } catch (error) {
                        // Skip corrupted backups
                        console.warn(`Corrupted backup folder: ${folder}`);
                    }
                }
            }
            
            return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            return [];
        }
    }

    async deleteBackup(backupId) {
        const backupPath = path.join(this.backupDir, backupId);
        
        try {
            await fs.rm(backupPath, { recursive: true, force: true });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async autoBackup() {
        // Create automatic backup (called periodically)
        return this.createBackup('auto');
    }

    async validateDataFiles() {
        const results = {};
        
        for (const file of this.dataFiles) {
            const filePath = path.join(__dirname, '..', file);
            try {
                const content = await fs.readFile(filePath, 'utf8');
                JSON.parse(content); // Validate JSON
                results[file] = { valid: true, size: content.length };
            } catch (error) {
                results[file] = { valid: false, error: error.message };
            }
        }
        
        return results;
    }
}

module.exports = BackupService;