"use client"

import type React from "react"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Upload, Loader2, Camera } from "lucide-react"
import { motion } from "framer-motion"
import { createReport } from "@/lib/api"
import { useRouter } from "next/navigation"

interface ReportIssueFormProps {
  onSubmit?: () => void
}

export function ReportIssueForm({ onSubmit }: ReportIssueFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    base64_image: "",
    image_type: ""
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Get file type
      const fileType = file.type;
      
      // Create a FileReader to convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result contains the prefix (data:image/jpeg;base64,) which we need to remove
        const base64Result = reader.result as string;
        const base64Data = base64Result.split(',')[1]; // Get only the base64 data part
        
        setImagePreview(base64Result);
        
        // Update form data with base64 image and type
        setFormData(prev => ({
          ...prev,
          base64_image: base64Data,
          image_type: fileType
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Create a hidden input of type file with capture attribute
    const cameraInput = document.createElement('input');
    cameraInput.type = 'file';
    cameraInput.accept = 'image/*';
    cameraInput.capture = 'environment'; // Use the back camera by default
    
    // Handle the file selection the same way as regular uploads
    cameraInput.onchange = (e) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (file) {
        // Get file type
        const fileType = file.type;
        
        // Create a FileReader to convert image to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          // The result contains the prefix (data:image/jpeg;base64,) which we need to remove
          const base64Result = reader.result as string;
          const base64Data = base64Result.split(',')[1]; // Get only the base64 data part
          
          setImagePreview(base64Result);
          
          // Update form data with base64 image and type
          setFormData(prev => ({
            ...prev,
            base64_image: base64Data,
            image_type: fileType
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    
    // Trigger the file selection dialog
    cameraInput.click();
  };

  const fetchCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Using reverse geocoding with maximum detail level (zoom=18)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&namedetails=1`
            );
            const data = await response.json();
            
            // Format a highly detailed address from the response
            let locationString = '';
            if (data.address) {
              // Extract all possible address components for maximum detail
              const address = data.address;
              
              // Build primary location details (building level)
              const primaryDetails = [
                address.building,
                address.house_number,
                address.house_name,
                address.road,
                address.footway,
                address.pedestrian,
                address.street
              ].filter(Boolean);
              
              // Build secondary location details (neighborhood level)
              const secondaryDetails = [
                address.neighbourhood,
                address.quarter,
                address.hamlet,
                address.suburb,
                address.residential
              ].filter(Boolean);
              
              // Build city level details
              const cityDetails = [
                address.village,
                address.town,
                address.city_district,
                address.city,
                address.municipality
              ].filter(Boolean);
              
              // Build region level details
              const regionDetails = [
                address.county,
                address.state_district,
                address.state,
                address.region,
                address.postcode
              ].filter(Boolean);
              
              // Create detailed sections of the address
              const primarySection = primaryDetails.length ? primaryDetails.join(', ') : '';
              const secondarySection = secondaryDetails.length ? secondaryDetails.join(', ') : '';
              const citySection = cityDetails.length ? cityDetails.join(', ') : '';
              const regionSection = regionDetails.length ? regionDetails.join(', ') : '';
              
              // Combine all sections with appropriate separators
              const sections = [primarySection, secondarySection, citySection, regionSection]
                .filter(section => section.length > 0);
              
              locationString = sections.join(', ');
              
              // For additional precision, add what3words style precision with the exact coordinates
              locationString += ` (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
              
              // If we have POI information, add it as a prefix
              if (address.amenity || address.shop || address.tourism || address.leisure) {
                const poi = address.amenity || address.shop || address.tourism || address.leisure;
                locationString = `${poi}, ${locationString}`;
              }
            } else if (data.display_name) {
              // Fallback to display_name if address details aren't available
              locationString = data.display_name;
            } else {
              // Last resort fallback to coordinates
              locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            }
            
            // Update the location field
            setFormData(prev => ({
              ...prev,
              location: locationString
            }));
          } catch (error) {
            console.error("Error fetching location:", error);
            // Fallback to coordinates only if the reverse geocoding fails
            const { latitude, longitude } = position.coords;
            setFormData(prev => ({
              ...prev,
              location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            }));
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
          // Show an error message to the user
          alert("Could not get your current location. Please enter it manually.");
        },
        { 
          enableHighAccuracy: true,  // Request high accuracy GPS data
          timeout: 15000,            // Longer timeout for better accuracy
          maximumAge: 0              // Always get fresh location data
        }
      );
    } else {
      alert("Geolocation is not supported by your browser. Please enter your location manually.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare the data object according to the required structure
      const reportData = {
        title: formData.title,
        description: formData.description,
        type: "miscellaneous", // Setting default value as specified
        location: formData.location,
        base64_image: formData.base64_image,
        image_type: formData.image_type
      };

      // Send request to create report
      const response = await createReport(reportData);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        base64_image: "",
        image_type: ""
      });
      setImagePreview(null);
      
      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit();
      }
      
      // Navigate to community page to see the new report
      router.push("/dashboard/community");
      router.refresh();
      
    } catch (error) {
      console.error("Error creating report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Issue Title</Label>
          <Input 
            id="title" 
            placeholder="Enter a descriptive title" 
            required 
            value={formData.title}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Describe the issue in detail" 
            className="min-h-[100px]" 
            required
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <div className="flex gap-2">
            <Input 
              id="location" 
              placeholder="Enter address or location" 
              className="flex-1" 
              required
              value={formData.location}
              onChange={handleInputChange}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={fetchCurrentLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Or use current location</p>
        </div>

        <div>
          <Label htmlFor="image">Upload Image</Label>
          <div className="mt-1 flex items-center gap-4">
            <div className="flex-1 flex gap-2">
              <label
                htmlFor="image-upload"
                className="flex-1 flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-700 bg-black/20 px-6 py-4 text-center hover:bg-gray-900/30 transition-colors"
              >
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400">Drag & drop or click to upload</span>
                </div>
                <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={handleCameraCapture}
                className="h-32 w-20 flex flex-col items-center justify-center border border-dashed border-gray-700 bg-black/20 px-2 py-4 hover:bg-gray-900/30 transition-colors"
              >
                <div className="flex flex-col items-center gap-1">
                  <Camera className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400">Take Photo</span>
                </div>
              </Button>
            </div>
            
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-32 w-32 rounded-md overflow-hidden border border-gray-700"
              >
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>
      </div>
    </form>
  )
}
