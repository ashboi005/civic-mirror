"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { getUserDetails, createUserDetails, updateUserDetails, UserDetails } from "@/lib/api"
import { TabsContent } from "@/components/ui/tabs"

export function PersonalDetailsSection() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userDetailsForm, setUserDetailsForm] = useState({
    age: 0,
    sex: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    pin_code: ""
  })

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const data = await getUserDetails();
        setUserDetails(data);
        setUserDetailsForm({
          age: data.age,
          sex: data.sex,
          phone_number: data.phone_number,
          address: data.address,
          city: data.city,
          state: data.state,
          pin_code: data.pin_code
        });
      } catch (err) {
        console.error("Failed to fetch user details:", err);
        // If 404, it means user details don't exist yet, which is fine
        if ((err as any)?.response?.status !== 404) {
          setError("Failed to load user details. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleUserDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserDetailsForm(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
  };

  const handleUserDetailsSave = async () => {
    setIsSaving(true);
    try {
      let result;
      if (userDetails?.id) {
        // Update existing user details
        result = await updateUserDetails(userDetailsForm);
      } else {
        // Create new user details
        result = await createUserDetails(userDetailsForm);
      }
      setUserDetails(result);
      alert("User details saved successfully!");
    } catch (err) {
      console.error("Failed to save user details:", err);
      setError("Failed to save user details. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TabsContent value="personal-details" className="mt-0 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-gray-800 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>
              {userDetails?.id 
                ? "Update your personal information" 
                : "Add your personal information"}
            </CardDescription>
          </CardHeader>
          {loading ? (
            <CardContent className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          ) : error ? (
            <CardContent>
              <p className="text-red-500">{error}</p>
            </CardContent>
          ) : (
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input 
                    id="age" 
                    name="age"
                    type="number" 
                    value={userDetailsForm.age} 
                    onChange={handleUserDetailsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex</Label>
                  <Select 
                    name="sex" 
                    value={userDetailsForm.sex}
                    onValueChange={(value) => setUserDetailsForm(prev => ({ ...prev, sex: value }))}
                  >
                    <SelectTrigger id="sex">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input 
                    id="phone_number" 
                    name="phone_number" 
                    value={userDetailsForm.phone_number} 
                    onChange={handleUserDetailsChange} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  name="address" 
                  value={userDetailsForm.address} 
                  onChange={handleUserDetailsChange} 
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    value={userDetailsForm.city} 
                    onChange={handleUserDetailsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input 
                    id="state" 
                    name="state" 
                    value={userDetailsForm.state} 
                    onChange={handleUserDetailsChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin_code">PIN Code</Label>
                  <Input 
                    id="pin_code" 
                    name="pin_code" 
                    value={userDetailsForm.pin_code} 
                    onChange={handleUserDetailsChange} 
                  />
                </div>
              </div>
            </CardContent>
          )}
          <CardFooter className="flex justify-end">
            <Button onClick={handleUserDetailsSave} disabled={isSaving || loading}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Details
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </TabsContent>
  )
}