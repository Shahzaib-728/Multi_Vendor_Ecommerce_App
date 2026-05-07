import { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function RefundModal({ order, isOpen, onClose, onSuccess }) {
    const [message, setMessage] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message) return setError('Please provide a reason for the refund');

        setLoading(true);
        setError('');
        try {
            await api.post('/refunds/request', {
                orderId: order._id,
                customerMessage: message,
                images: images
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit refund request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col mx-auto my-auto transition-all">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">Request Refund</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-black transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold mb-2">Reason for Refund</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full h-32 p-4 border rounded-xl focus:ring-2 focus:ring-black outline-none resize-none"
                            placeholder="Please describe why you are requesting a refund..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Proof of Damage/Issue (Images)</label>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {images.map((img, i) => (
                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                                    <img src={img} className="w-full h-full object-cover" alt="Proof" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {images.length < 3 && (
                                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                    <Upload size={24} className="text-slate-400 mb-1" />
                                    <span className="text-[10px] text-slate-500 font-medium">Upload</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">You can upload up to 3 images as proof.</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
