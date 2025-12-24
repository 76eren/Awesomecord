import Navbar from "../navbar/navbar.tsx";
import {useUserStore} from "../../store/user-store.ts";
import {useEffect, useState} from "react";
import Cropper from "react-easy-crop";
import {setProfilePicture} from "../../services/user-service.ts";
import {toast} from "react-toastify";

export default function Profile() {
    const user = useUserStore((s) => s.user);
    const isLoading = useUserStore((s) => s.isLoading);
    const error = useUserStore((s) => s.error);
    const fetchUser = useUserStore((s) => s.fetchUser);
    const profilePictureUrl = useUserStore((s) => s.profilePictureUrl);

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    useEffect(() => {
        if (!user && !isLoading) {
            void fetchUser();
        }
    }, [user, isLoading, fetchUser]);

    if (isLoading) return <h1 className="text-center mt-20 text-lg font-medium">Loading...</h1>;
    if (error != null) return <h1 className="text-center mt-20 text-lg font-medium text-red-600">An unknown error
        occurred.</h1>;
    if (user == null) return <h1 className="text-center mt-20 text-lg font-medium">Loading...</h1>;

    function onCropComplete(_: any, croppedAreaPixels: any) {
        setCroppedAreaPixels(croppedAreaPixels);
    }

    function readFile(file: File): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => resolve(reader.result as string), false);
            reader.readAsDataURL(file);
        });
    }

    async function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setSelectedFile(file);
            setShowCropper(true);
        }
    }

    async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
        const image = new Image();
        image.src = imageSrc;
        await new Promise((resolve) => (image.onload = resolve));

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
            }, "image/jpeg");
        });
    }

    async function handleCropDone() {
        if (!croppedAreaPixels || !imageSrc || !selectedFile) return;

        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        const croppedUrl = URL.createObjectURL(croppedBlob);
        setCroppedImage(croppedUrl);

        try {
            const croppedFile = new File([croppedBlob], selectedFile.name, {type: "image/jpeg"});

            await setProfilePicture(croppedFile);
            toast.success("profile picture updated successfully!");

        } catch (err) {
            console.error("Failed to upload profile picture:", err);
        }

        setShowCropper(false);
        setImageSrc(null);
        setSelectedFile(null);
    }

    function handleCancelCrop() {
        setShowCropper(false);
        setImageSrc(null);
        setSelectedFile(null);
    }

    return (
        <div className="min-h-screen flex bg-white">
            <Navbar/>
            <main className="flex-1 flex justify-center items-center p-6">
                <div className="w-full max-w-lg bg-white shadow-md rounded-2xl p-8 border border-gray-100">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <img
                                src={croppedImage || profilePictureUrl}
                                alt="Profile Picture"
                                className="w-32 h-32 rounded-full object-cover border border-gray-200"
                            />
                            <label
                                htmlFor="upload"
                                className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-blue-700"
                            >
                                Change
                            </label>
                            <input
                                id="upload"
                                type="file"
                                accept="image/*"
                                onChange={onSelectFile}
                                className="hidden"
                            />
                        </div>
                        <h1 className="text-2xl font-semibold">{user.displayName}</h1>
                        <p className="text-gray-500 mb-2">@{user.userHandle}</p>
                        {user.bio && <p className="text-gray-700 text-sm mb-4">{user.bio}</p>}
                    </div>

                    <div className="mt-6 space-y-2 text-gray-800">
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="font-medium">Full Name:</span>
                            <span>{user.firstName} {user.lastName}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="font-medium">Email:</span>
                            <span>{user.email}</span>
                        </div>
                        {user.phone && (
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="font-medium">Phone:</span>
                                <span>{user.phone}</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {showCropper && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex flex-col justify-center items-center z-50">
                    <div className="relative w-80 h-80 bg-transparent rounded-lg overflow-hidden">
                        <Cropper
                            image={imageSrc || ""}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={handleCancelCrop}
                            className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCropDone}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
