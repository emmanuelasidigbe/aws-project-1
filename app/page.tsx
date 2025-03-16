/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Grid,
  Clock,
  Star,
  X,
} from "lucide-react";
import { deleteImage, uploadImage } from "./actions";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Trash2 } from "lucide-react";

const ImageGallery = () => {
  interface ImageData {
    key: string;
    url: string;
    title: string;
    uploadDate: string;
  }

  const [images, setImages] = useState<ImageData[]>([]);
  const [file, setFile] = useState<File | null>();
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage, setImagesPerPage] = useState(9);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [newImageTitle, setNewImageTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pageloading, setPageLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate pagination values
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images?.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(images.length / imagesPerPage);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1536) {
        setImagesPerPage(12);
      } else if (window.innerWidth >= 1280) {
        setImagesPerPage(9);
      } else if (window.innerWidth >= 768) {
        setImagesPerPage(6);
      } else {
        setImagesPerPage(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          setPreviewUrl(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset upload form when dialog is closed
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setNewImageTitle("");
      setPreviewUrl(null);
    }
    setIsUploadDialogOpen(open);
  };
  async function getData() {
    const res = await fetch("/api/images");
    if (res.ok) {
      const data = await res.json();
      setImages(data);
    }
    setPageLoading(false);
  }
  async function handleUpload() {
    toast("Image is being uploaded");
    if (file && file.type.startsWith("image/")) {
      const formData = new FormData();
      formData.append("title", newImageTitle);
      formData.append("file", file);
      const response = await uploadImage(formData);
      if (response?.success) {
        toast("Image uploaded sucessfully");
        getData();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  }
  async function handleDelete(key: string) {
    toast("Image is being deleted");
    const response = await deleteImage(key);
    if (response.success) {
      toast("Image deleted sucessfully");
      getData();
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-zinc-950 text-zinc-200">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-100">Image Gallery</h1>
        <Button
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          Menu
        </Button>
      </div>

      {/* Sidebar - responsive */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } lg:block w-full lg:w-64 bg-zinc-900 border-r border-zinc-800 ${
          sidebarOpen ? "fixed inset-0 z-50 lg:relative" : ""
        }`}
      >
        <div className="flex lg:hidden justify-end p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold text-zinc-100 mb-6">
            Image Gallery
          </h1>
          <Button
            className="w-full bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
            onClick={() => {
              setIsUploadDialogOpen(true);
              setSidebarOpen(false);
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
        </div>

        <nav className="mt-6">
          <div className="px-4 py-2 text-sm font-medium text-zinc-400">
            Categories
          </div>
          <div className="mt-2 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setSidebarOpen(false)}
            >
              <Grid className="mr-2 h-4 w-4" />
              All Images
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setSidebarOpen(false)}
            >
              <Clock className="mr-2 h-4 w-4" />
              Recent Uploads
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setSidebarOpen(false)}
            >
              <Star className="mr-2 h-4 w-4" />
              Favorites
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-xl font-semibold text-zinc-100">All Images</h2>
          <div className="text-sm text-zinc-400">
            Showing {indexOfFirstImage + 1}-
            {Math.min(indexOfLastImage, images.length)} of {images.length}{" "}
            images
          </div>
        </div>

        {/* Image Grid - Gallery Style with responsive columns */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4 mb-8">
          {pageloading &&
            Array(9)
              .fill(0)
              .map((_, index) => (
                <Card key={`skeleton-${index}`} className="">
                  <Skeleton className="h-full w-full aspect-square" />
                  <CardContent className="p-2 sm:p-3">
                    <Skeleton className="h-4 sm:h-5 w-3/4" />
                  </CardContent>
                  <CardFooter className="border-t border-zinc-700 p-2 sm:p-3 bg-zinc-850">
                    <Skeleton className="h-3 w-2/3" />
                  </CardFooter>
                </Card>
              ))}
          {currentImages.map((image) => (
            <ContextMenu key={image.key}>
              <ContextMenuTrigger>
                <Card className="bg-zinc-800 border-zinc-700 overflow-hidden hover:ring-1 hover:ring-zinc-600 transition-all duration-200 ">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <CardContent className="p-2 sm:p-3">
                    <h3 className="font-medium text-zinc-100 truncate text-sm sm:text-base">
                      {image.title}
                    </h3>
                  </CardContent>
                  <CardFooter className="border-t border-zinc-700 p-2 sm:p-3 bg-zinc-850 text-xs text-zinc-400">
                    Uploaded on {image.uploadDate}
                  </CardFooter>
                </Card>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48 shadow-2xl shadow-zinc-600 rounded-[.3rem]">
                <ContextMenuItem
                  onClick={() => handleDelete(image.key)}
                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>

        {/* Responsive Pagination Controls */}
        <div className="flex justify-center mt-6 md:mt-8">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 hidden sm:flex"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Mobile pagination */}
            <div className="flex sm:hidden items-center space-x-2">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 px-2 py-1 h-8"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </Button>

              <span className="text-zinc-400 text-sm">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 px-2 py-1 h-8"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>

            {/* Desktop pagination */}
            <div className="hidden sm:flex space-x-1 mx-2">
              {totalPages <= 7 ? (
                // Show all pages if total pages is 7 or less
                [...Array(totalPages).keys()].map((number) => (
                  <Button
                    key={number + 1}
                    variant={currentPage === number + 1 ? "default" : "outline"}
                    className={
                      currentPage === number + 1
                        ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    }
                    onClick={() => setCurrentPage(number + 1)}
                    size="sm"
                  >
                    {number + 1}
                  </Button>
                ))
              ) : (
                // Show limited pages with ellipsis for large page counts
                <>
                  <Button
                    variant={currentPage === 1 ? "default" : "outline"}
                    className={
                      currentPage === 1
                        ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    }
                    onClick={() => setCurrentPage(1)}
                    size="sm"
                  >
                    1
                  </Button>

                  {currentPage > 3 && (
                    <span className="px-1 text-zinc-500">...</span>
                  )}

                  {/* Pages around current page */}
                  {[...Array(5)].map((_, idx) => {
                    const pageNumber = currentPage - 2 + idx;
                    return pageNumber > 1 && pageNumber < totalPages ? (
                      <Button
                        key={pageNumber}
                        variant={
                          currentPage === pageNumber ? "default" : "outline"
                        }
                        className={
                          currentPage === pageNumber
                            ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                            : "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                        }
                        onClick={() => setCurrentPage(pageNumber)}
                        size="sm"
                      >
                        {pageNumber}
                      </Button>
                    ) : null;
                  })}

                  {currentPage < totalPages - 2 && (
                    <span className="px-1 text-zinc-500">...</span>
                  )}

                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    className={
                      currentPage === totalPages
                        ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                    }
                    onClick={() => setCurrentPage(totalPages)}
                    size="sm"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 hidden sm:flex"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Dialog with Image Preview */}
      <Dialog open={isUploadDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-700 text-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              Upload New Image
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="image-title" className="text-zinc-300">
                Image Title
              </Label>
              <Input
                id="image-title"
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                placeholder="Enter image title"
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
              />
            </div>

            {/* Image Preview */}
            {previewUrl ? (
              <div className="mt-2 relative">
                <div className="aspect-square w-full overflow-hidden rounded-md border border-zinc-700">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                  onClick={() => setPreviewUrl(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 ${
                  isDragging ? "border-zinc-500" : "border-zinc-700"
                } border-dashed rounded-md transition-colors`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-zinc-500"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-zinc-400">
                    <label className="relative cursor-pointer bg-zinc-800 rounded-md font-medium text-zinc-300 hover:text-zinc-200 focus-within:outline-none px-2 py-1">
                      <span>Upload a file</span>
                      <input
                        ref={fileInputRef}
                        id="file-upload"
                        name="file-"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1 pt-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-zinc-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogChange(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleUpload();
                handleDialogChange(false);
              }}
              className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
              disabled={!previewUrl || newImageTitle.trim() === ""}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
};

export default ImageGallery;
