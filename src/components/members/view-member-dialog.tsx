import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface MemberDetails {
  user_personal: {
    nameOfBusinessOwner: string;
    designation: string;
    phone: string;
    email: string;
    memberId: string;
  };
  user_busines: {
    nameOfBusiness: string;
    businessPhoneNumber: string;
    address: string;
  };
  user_service: any;
  user_testimonial: any;
}

interface ViewMemberDialogProps {
  memberId: string;
}

export function ViewMemberDialog({ memberId }: ViewMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [memberDetails, setMemberDetails] = useState<MemberDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/getOneMember`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      });

      const data = await response.json();

      if (data.status === "Success") {
        setMemberDetails(data.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to fetch member details",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch member details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchMemberDetails();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs" className="h-7 w-7">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-4">Loading...</div>
        ) : memberDetails ? (
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="service">Service</TabsTrigger>
              <TabsTrigger value="testimonial">Testimonial</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Business Owner</p>
                      <p className="text-sm text-gray-500">{memberDetails.user_personal.nameOfBusinessOwner}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Designation</p>
                      <p className="text-sm text-gray-500">{memberDetails.user_personal.designation}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-500">{memberDetails.user_personal.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-500">{memberDetails.user_personal.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Business Name</p>
                      <p className="text-sm text-gray-500">{memberDetails.user_busines?.nameOfBusiness || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Business Phone</p>
                      <p className="text-sm text-gray-500">{memberDetails.user_busines?.businessPhoneNumber || "-"}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-gray-500">{memberDetails.user_busines?.address || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="service">
              <Card>
                <CardContent className="pt-6">
                  {memberDetails.user_service?.serviceId?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {memberDetails.user_service.serviceId.map((service: any) => (
                        <div 
                          key={service._id} 
                          className="group relative overflow-hidden rounded-lg transition-all hover:shadow-lg"
                        >
                          <div className="aspect-[4/3] overflow-hidden">
                            <img 
                              src={service.serviceImage} 
                              alt={service.serviceTitle}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="absolute bottom-0 p-4 text-white">
                              <h4 className="text-lg font-semibold tracking-tight">
                                {service.serviceTitle}
                              </h4>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <p className="text-sm">No services available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testimonial">
              <Card>
                <CardContent className="pt-6">
                  {memberDetails.user_testimonial && 
                   memberDetails.user_testimonial._id && 
                   memberDetails.user_testimonial.memberId && 
                   memberDetails.user_testimonial.__v !== undefined ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium">No testimonial content</p>
                          <p className="text-xs text-muted-foreground mt-1">This member hasn't provided a testimonial yet</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium">No testimonial available</p>
                        <p className="text-xs text-muted-foreground mt-1">This member hasn't provided a testimonial yet</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}