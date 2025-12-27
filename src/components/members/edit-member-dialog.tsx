import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const memberFormSchema = z.object({
  nameOfBusinessOwner: z.string().min(2, "Name must be at least 2 characters"),
  businessName: z.string().optional(),
  designation: z.string().min(2, "Designation must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
  chapter: z.string().min(1, "Please select a chapter"),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

interface EditMemberDialogProps {
  member: {
    member_personal_detail: {
      nameOfBusinessOwner: string;
      designation: string;
      phone: string;
      email: string;
      memberId: string;
      _id: string;
      chapter?: string | { _id: string; chapterName: string };
    };
    member_business_detail?: {
      nameOfBusiness?: string;
    } | null;
  };
  onSave: (updatedMember: any) => Promise<void>;
}

interface Chapter {
  _id: string;
  chapterName: string;
}

export function EditMemberDialog({ member, onSave }: EditMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const { toast } = useToast();

  // Get chapter ID whether it's a string or populated object
  const getChapterId = () => {
    const chapter = member.member_personal_detail.chapter;
    if (!chapter) return "";
    if (typeof chapter === "string") return chapter;
    return chapter._id || "";
  };

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      nameOfBusinessOwner: member.member_personal_detail.nameOfBusinessOwner,
      businessName: member.member_business_detail?.nameOfBusiness || "",
      designation: member.member_personal_detail.designation,
      phone: member.member_personal_detail.phone,
      email: member.member_personal_detail.email,
      chapter: getChapterId(),
    },
  });

  useEffect(() => {
    if (open) {
      fetchChapters();
    }
  }, [open]);

  const fetchChapters = async () => {
    setLoadingChapters(true);
    try {
      const response = await fetch("/api/admin/chapter");
      const data = await response.json();
      if (data.status === "Success") {
        setChapters(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chapters",
      });
    } finally {
      setLoadingChapters(false);
    }
  };

  const onSubmit = async (data: MemberFormValues) => {
    try {
      await onSave({
        member_personal_detail: {
          ...member.member_personal_detail,
          ...data,
        },
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update member",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs" className="h-7 w-7">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nameOfBusinessOwner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Owner Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chapter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingChapters ? "Loading chapters..." : "Select a chapter"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter._id} value={chapter._id}>
                          {chapter.chapterName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}