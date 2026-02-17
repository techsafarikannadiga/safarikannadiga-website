'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ImageEditorModal from './ImageEditorModal';

interface UploadQueueModalProps {
    files: File[];
    isOpen: boolean;
    onClose: () => void;
    onUpload: (files: File[]) => void;
    onFilesChange: (files: File[]) => void;
}

export function UploadQueueModal({ files, isOpen, onClose, onUpload, onFilesChange }: UploadQueueModalProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleRemoveFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFilesChange(newFiles);
        if (newFiles.length === 0) onClose();
    };

    const handleSaveEdit = (croppedFile: File) => {
        if (editingIndex === null) return;
        const newFiles = [...files];
        newFiles[editingIndex] = croppedFile;
        onFilesChange(newFiles);
        setEditingIndex(null);
    };

    const handleAddMore = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFilesChange([...files, ...Array.from(e.target.files)]);
            e.target.value = ''; // Reset input
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] p-8 max-w-4xl w-full shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h3 className="text-2xl font-bold font-heading text-neutral-charcoal">Review Uploads</h3>
                        <p className="text-sm text-neutral-gray">Crop or edit images before publishing</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-neutral-gray hover:text-neutral-charcoal">
                        Close
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[200px] pr-2 pb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {files.map((file, idx) => (
                            <div key={`${file.name}-${idx}`} className="group relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
                                <Image
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    fill
                                    className="object-cover"
                                />

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                    <button
                                        onClick={() => setEditingIndex(idx)}
                                        className="p-2 bg-white text-neutral-charcoal rounded-full hover:bg-safari-gold hover:text-white transition-all shadow-lg transform hover:scale-110"
                                        title="Edit Image"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleRemoveFile(idx)}
                                        className="p-2 bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg transform hover:scale-110"
                                        title="Remove"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="absolute bottom-2 left-2 right-2 flex justify-center pointer-events-none">
                                    <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full truncate max-w-full backdrop-blur-sm">
                                        {(file.size / 1024 / 1024).toFixed(1)} MB
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Add More Button */}
                        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-safari-gold hover:bg-safari-gold/5 transition-all group">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-safari-gold/10 transition-colors mb-2">
                                <svg className="w-6 h-6 text-gray-400 group-hover:text-safari-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-gray-400 group-hover:text-safari-gold transition-colors">Add More</span>
                            <input type="file" multiple accept="image/*" onChange={handleAddMore} className="hidden" />
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-between items-center shrink-0">
                    <span className="text-sm font-bold text-neutral-gray">
                        {files.length} {files.length === 1 ? 'image' : 'images'} selected
                    </span>
                    <button
                        onClick={() => onUpload(files)}
                        className="px-8 py-3 bg-safari-gold text-white font-bold rounded-xl shadow-lg hover:bg-safari-gold-dark hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <span>Upload All Images</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Image Editor integration */}
            {editingIndex !== null && (
                <ImageEditorModal
                    image={files[editingIndex]}
                    isOpen={true}
                    onClose={() => setEditingIndex(null)}
                    onSave={handleSaveEdit}
                />
            )}
        </div>
    );
}
