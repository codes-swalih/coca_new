import * as React from "react"
import { FC } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { Club, ClubFormData, Event, Member } from "@/types/club"
import { useToast } from "@/hooks/use-toast"

interface ClubDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  club?: Club
}

interface MemberResponse {
  status: string
  data: Array<{
    member_personal_detail: {
      memberId: string
      nameOfBusinessOwner: string
    }
  }>
}

interface EventResponse {
  status: string
  data: Array<{
    _id: string
    eventTitle: string
  }>
}

const initialFormData: ClubFormData = {
  clubName: "",
  since: "",
  clubManager: "",
  members: [],
  events: [],
  image: "",
}

export const ClubDialog: FC<ClubDialogProps> = ({ open, onOpenChange, onSuccess, club }) => {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [members, setMembers] = React.useState<Member[]>([])
  const [events, setEvents] = React.useState<Event[]>([])
  const [formData, setFormData] = React.useState<ClubFormData>(initialFormData)

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/admin/membersListing")
      const data = await response.json()
      console.log(data);
      
    
      

      
      if (data?.status === "Success" && Array.isArray(data.data)) {
        const validMembers = []
        for (const item of data.data) {
          if (item?.member_personal_detail?._id && 
              item?.member_personal_detail?.nameOfBusinessOwner) {
            validMembers.push({
              _id: item.member_personal_detail._id,
              nameOfBusinessOwner: item.member_personal_detail.nameOfBusinessOwner
            })
          }
        }
        setMembers(validMembers)
        console.log(members);
        
      }
    } catch (error) {
      console.error("Error fetching members:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch members"
      })
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/events")
      const data = await response.json()

      if (data?.status === "Success" && Array.isArray(data.data)) {
        const validEvents = []
        for (const event of data.data) {
          if (event?._id && event?.eventTitle) {
            validEvents.push({
              _id: event._id,
              name: event.eventTitle
            })
          }
        }
        setEvents(validEvents)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch events"
      })
    }
  }

  React.useEffect(() => {
    if (open) {
      fetchMembers()
      fetchEvents()
      if (club) {
        setFormData({
          clubName: club.clubName || "",
          since: club.since || "",
          clubManager: club.clubManager?._id || "",
          members: club.members?.map(m => m._id) || [],
          events: club.events?.map(e => e._id) || [],
          image: club.image || ""
        })
      } else {
        setFormData(initialFormData)
      }
    }
  }, [open, club])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.clubName.trim() || !formData.since || !formData.clubManager) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        club ? `/api/admin/clubs/${club._id}` : "/api/admin/clubs",
        {
          method: club ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save club")
      }

      const data = await response.json()
      if (data.status === "Success") {
        toast({
          title: "Success",
          description: club ? "Club updated successfully" : "Club created successfully"
        })
        onSuccess()
        onOpenChange(false)
      } else {
        throw new Error(data.message || "An error occurred")
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {club ? "Edit Club" : "Create New Club"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clubName" className="text-sm font-medium">Club Name</Label>
              <Input
                id="clubName"
                value={formData.clubName}
                onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                placeholder="Enter club name"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="since" className="text-sm font-medium">Since</Label>
              <Input
                id="since"
                type="date"
                value={formData.since}
                onChange={(e) => setFormData({ ...formData, since: e.target.value })}
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Club Manager</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between bg-background"
                  type="button"
                >
                  {members 
                    ? members.map(m => m._id === formData.clubManager ? m.nameOfBusinessOwner : null).filter(Boolean)[0] || "Select manager"
                    : "Select manager"}
                  <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search managers..." className="h-9" />
                  <CommandEmpty>No manager found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-48">
                      {members.map((member) => (
                        <CommandItem
                          key={member._id}
                          onSelect={() => setFormData({ ...formData, clubManager: member._id })}
                          className="cursor-pointer"
                        >
                          <CheckIcon
                            className={`mr-2 h-4 w-4 ${formData.clubManager === member._id ? "opacity-100" : "opacity-0"}`}
                          />
                          {member.nameOfBusinessOwner}
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Members</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between bg-background"
                  type="button"
                >
                  {formData.members.length
                    ? `${formData.members.length} members selected`
                    : "Select members"}
                  <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search members..." className="h-9" />
                  <CommandEmpty>No member found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-48">
                      {members.map((member) => (
                        <CommandItem
                          key={member._id}
                          onSelect={() => {
                            const newMembers = formData.members.includes(member._id)
                              ? formData.members.filter(id => id !== member._id)
                              : [...formData.members, member._id]
                            setFormData({ ...formData, members: newMembers })
                          }}
                          className="cursor-pointer"
                        >
                          <CheckIcon
                            className={`mr-2 h-4 w-4 ${formData.members.includes(member._id) ? "opacity-100" : "opacity-0"}`}
                          />
                          {member.nameOfBusinessOwner}
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.members.map(memberId => {
                const member = members.find(m => m._id === memberId)
                return member ? (
                  <Badge key={member._id} variant="secondary" className="px-2 py-1">
                    {member.nameOfBusinessOwner}
                    <button
                      type="button"
                      className="ml-1 hover:text-destructive"
                      onClick={() => setFormData({
                        ...formData,
                        members: formData.members.filter(id => id !== member._id)
                      })}
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Events</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between bg-background"
                  type="button"
                >
                  {formData.events.length
                    ? `${formData.events.length} events selected`
                    : "Select events"}
                  <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search events..." className="h-9" />
                  <CommandEmpty>No event found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-48">
                      {events.map((event) => (
                        <CommandItem
                          key={event._id}
                          onSelect={() => {
                            const newEvents = formData.events.includes(event._id)
                              ? formData.events.filter(id => id !== event._id)
                              : [...formData.events, event._id]
                            setFormData({ ...formData, events: newEvents })
                          }}
                          className="cursor-pointer"
                        >
                          <CheckIcon
                            className={`mr-2 h-4 w-4 ${formData.events.includes(event._id) ? "opacity-100" : "opacity-0"}`}
                          />
                          {event.name}
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.events.map(eventId => {
                const event = events.find(e => e._id === eventId)
                return event ? (
                  <Badge key={event._id} variant="secondary" className="px-2 py-1">
                    {event.name}
                    <button
                      type="button"
                      className="ml-1 hover:text-destructive"
                      onClick={() => setFormData({
                        ...formData,
                        events: formData.events.filter(id => id !== event._id)
                      })}
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="Enter image URL"
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-4"
            >
              {loading ? "Loading..." : club ? "Update Club" : "Create Club"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}