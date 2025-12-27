import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  secondaryPhone: z.string().min(10, "Secondary phone number must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
  chapter: z.string().min(1, "Please select a chapter"),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

interface AddMemberDialogProps {
  onAdd: (member: MemberFormValues) => Promise<void>;
}

interface Chapter {
  _id: string;
  chapterName: string;
}

export function AddMemberDialog({ onAdd }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const { toast } = useToast();

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      nameOfBusinessOwner: "",
      businessName: "",
      designation: "",
      phone: "",
      email: "",
      chapter: "",
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
      await onAdd(data);
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add member",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Member</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
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
                    <Input {...field} />
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
                    <Input {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondaryPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Phone</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
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
              <Button type="submit">Add Member</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}