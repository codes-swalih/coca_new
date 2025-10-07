'use client';

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ClubDialog } from "@/components/clubs/club-dialog"
import { Club } from "@/types/club"
import { useToast } from "@/hooks/use-toast"

export default function ClubsPage() {
  const { toast } = useToast()
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedClub, setSelectedClub] = useState<Club | undefined>(undefined)

  const fetchClubs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/clubs')
      if (!response.ok) throw new Error('Failed to fetch clubs')
      const data = await response.json()
      if (data.status === 'Success') {
        setClubs(data.data)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch clubs"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (club: Club) => {
    setSelectedClub(club)
    setDialogOpen(true)
  }

  const handleDelete = async (clubId: string) => {
    if (!confirm('Are you sure you want to delete this club?')) return

    try {
      const response = await fetch(`/api/admin/clubs/${clubId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete club')
      
      const data = await response.json()
      if (data.status === 'Success') {
        toast({
          title: "Success",
          description: "Club deleted successfully"
        })
        fetchClubs()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete club"
      })
    }
  }

  const filteredClubs = clubs.filter(club =>
    club.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.clubManager?.nameOfBusinessOwner.toLowerCase().includes(searchQuery.toLowerCase())
  )


  useEffect(() => {
    fetchClubs()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Clubs</h2>
        <Button onClick={() => {
          setSelectedClub(undefined)
          setDialogOpen(true)
        }}>
          Create Club
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search clubs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Club Name</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Since</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Events</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClubs.map((club) => (
              <TableRow key={club._id}>
                <TableCell className="font-medium">{club.clubName}</TableCell>
                <TableCell>{club.clubManager?.nameOfBusinessOwner}</TableCell>
                <TableCell>{new Date(club.since).toLocaleDateString()}</TableCell>
                <TableCell>{club.members.length}</TableCell>
                <TableCell>{club.events.length}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(club)}
                    className="mr-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(club._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ClubDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        club={selectedClub}
        onSuccess={fetchClubs}
      />
    </div>
  )
}