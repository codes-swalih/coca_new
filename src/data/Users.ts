import { StaticImageData } from "next/image";
import Avatar1 from "@/assets/images/avatar_1.jpg";
import Avatar2 from "@/assets/images/avatar_2.jpg";
import Avatar3 from "@/assets/images/avatar_3.jpg";
import Avatar4 from "@/assets/images/avatar_4.jpg";
import Avatar5 from "@/assets/images/avatar_5.jpg";

interface User {
    key: string;
    name: string;
    avatar: StaticImageData | string;
    userId: string;
    email: string;
    phone: string;
    role: string;
}

interface CapabilityOption {
    label: string;
    value: string;
}

interface CapabilityGroup {
    category: string;
    options: CapabilityOption[];
}

export const users: User[] = [
    {
        key: "1",
        userId: "USR001",
        name: "John Doe",
        avatar: Avatar1,
        email: "john.doe@example.com",
        phone: "+1234567890",
        role: "Admin",
    },
    {
        key: "2",
        userId: "USR002",
        name: "Jane Smith",
        avatar: Avatar2,
        email: "jane.smith@example.com",
        phone: "+9876543210",
        role: "Moderator",
    },
    {
        key: "3",
        userId: "USR003",
        name: "Robert Brown",
        avatar: Avatar3,
        email: "robert.brown@example.com",
        phone: "+1928374650",
        role: "User",
    },
    {
        key: "4",
        userId: "USR004",
        name: "Emily Johnson",
        avatar: Avatar4,
        email: "emily.johnson@example.com",
        phone: "+5647382910",
        role: "User",
    },
    {
        key: "5",
        userId: "USR005",
        name: "Michael Lee",
        avatar: Avatar5,
        email: "michael.lee@example.com",
        phone: "+3456789012",
        role: "Admin",
    },
    {
        key: "6",
        userId: "USR006",
        name: "Sophia Turner",
        email: "sophia.turner@example.com",
        phone: "+9876543211",
        role: "User",
        avatar: Avatar1,
    },
    {
        key: "7",
        userId: "USR007",
        name: "David Williams",
        email: "david.williams@example.com",
        phone: "+1928374651",
        role: "Moderator",
        avatar: Avatar2,
    },
    {
        key: "8",
        userId: "USR008",
        name: "Olivia Brown",
        email: "olivia.brown@example.com",
        phone: "+5647382911",
        role: "User",
        avatar: Avatar3,
    },
    {
        key: "9",
        userId: "USR009",
        name: "James Wilson",
        email: "james.wilson@example.com",
        phone: "+3456789013",
        role: "Admin",
        avatar: Avatar4,
    },
    {
        key: "10",
        userId: "USR010",
        name: "Ava Martinez",
        email: "ava.martinez@example.com",
        phone: "+8765432109",
        role: "Moderator",
        avatar: Avatar5,
    }
];

export const capabilitiesData: CapabilityGroup[] = [
    {
        category: "User Management",
        options: [
            { label: "Add Role", value: "add_role" },
            { label: "Edit Role", value: "edit_role" },
            { label: "Delete Role", value: "delete_role" },
            { label: "Add User", value: "add_user" },
            { label: "Edit User", value: "edit_user" },
            { label: "Delete User", value: "delete_user" },
            { label: "Reset Password", value: "reset_password" },
        ],
    },
    {
        category: "State Management",
        options: [
            { label: "Add State", value: "add_state" },
            { label: "Edit State", value: "edit_state" },
            { label: "Delete State", value: "delete_state" },
        ],
    },
    {
        category: "District Management",
        options: [
            { label: "Add District", value: "add_district" },
            { label: "Edit District", value: "edit_district" },
            { label: "Delete District", value: "delete_district" },
        ],
    },
    {
        category: "Zone Management",
        options: [
            { label: "Add Zone", value: "add_zone" },
            { label: "Edit Zone", value: "edit_zone" },
            { label: "Delete Zone", value: "delete_zone" },
        ],
    },
    {
        category: "Chapter Management",
        options: [
            { label: "Add Chapter", value: "add_chapter" },
            { label: "Edit Chapter", value: "edit_chapter" },
            { label: "Delete Chapter", value: "delete_chapter" },
        ],
    },
    {
        category: "Service Management",
        options: [
            { label: "Add Services", value: "add_services" },
            { label: "Edit Services", value: "edit_services" },
            { label: "Delete Services", value: "delete_services" },
        ],
    },
    {
        category: "Organization Members Management",
        options: [
            { label: "Add Member", value: "add_member" },
            { label: "Edit Member", value: "edit_member" },
            { label: "Terminate Member", value: "terminate_member" },
            { label: "Delete Member", value: "delete_member" },
        ],
    },
    {
        category: "Clubs Management",
        options: [
            { label: "Add Club", value: "add_club" },
            { label: "Edit Club", value: "edit_club" },
            { label: "Delete Club", value: "delete_club" },
        ],
    },
    {
        category: "Advertisement Management",
        options: [
            { label: "Create Advertisement", value: "create_advertisement" },
            { label: "Edit Advertisement", value: "edit_advertisement" },
            { label: "Delete Advertisement", value: "delete_advertisement" },
        ],
    },
    {
        category: "Event Management",
        options: [
            { label: "Create Event Category", value: "create_event_category" },
            { label: "Edit Event Category", value: "edit_event_category" },
            { label: "Delete Event Category", value: "delete_event_category" },
            { label: "Add Events", value: "add_events" },
            { label: "Edit Events", value: "edit_events" },
            { label: "Delete Events", value: "delete_events" },
        ],
    },
    {
        category: "Jewelry Management",
        options: [
            { label: "Add Jewelry", value: "add_jewelry" },
            { label: "Edit Jewelry Item", value: "edit_jewelry" },
            { label: "Delete Jewelry Item", value: "delete_jewelry" },
        ],
    },
    {
        category: "Reports and Analytics",
        options: [
            { label: "View Reports", value: "view_reports" },
            { label: "Download Reports", value: "download_reports" },
        ],
    },
];