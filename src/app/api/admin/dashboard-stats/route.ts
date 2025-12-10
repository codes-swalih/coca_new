import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import UserPersonal from "@/app/models/admin/UserPersonal";
import Clubs from "@/app/models/admin/Clubs";
import CocaEvents from "@/app/models/admin/CocaEvents";
import Events from "@/app/models/admin/Events";
import mongoose from "mongoose";

export const GET = async () => {
  try {
    await connectToMongoDB();

    // Get total members count
    const totalMembers = await UserPersonal.countDocuments();

    // Get active clubs count
    const activeClubs = await Clubs.countDocuments();

    // Get upcoming events count (events in the next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    // Since date is stored as string, we need to fetch all and filter
    const allEvents = await Events.find().select("date");
    const upcomingEvents = allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= thirtyDaysFromNow;
    }).length;

    // Get upcoming COCA events count
    const allCocaEvents = await CocaEvents.find().select("date");
    const upcomingCocaEvents = allCocaEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= thirtyDaysFromNow;
    }).length;

    const totalUpcomingEvents = upcomingEvents + upcomingCocaEvents;

    // Calculate growth rate (members added in last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentMembers = await UserPersonal.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const previousMembers = await UserPersonal.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });

    const growthRate = previousMembers > 0 
      ? ((recentMembers - previousMembers) / previousMembers) * 100 
      : 0;

    // Get recent activities (last 5 clubs and events)
    const recentClubs = await Clubs.find()
      .sort({ _id: -1 })
      .limit(3)
      .select("clubName");

    const recentEvents = await Events.find()
      .sort({ _id: -1 })
      .limit(3)
      .select("eventTitle");

    // Get upcoming events details
    const allUpcomingEvents = await Events.find().select("eventTitle date");
    const upcomingEventsDetails = allUpcomingEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
      .map(event => ({
        _id: event._id,
        eventName: event.eventTitle,
        eventDate: event.date,
      }));

    const allUpcomingCocaEvents = await CocaEvents.find().select("eventTitle date");
    const upcomingCocaEventsDetails = allUpcomingCocaEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
      .map(event => ({
        _id: event._id,
        eventName: event.eventTitle,
        eventDate: event.date,
      }));

    return NextResponse.json(
      {
        status: "Success",
        message: "Dashboard stats fetched successfully",
        data: {
          totalMembers,
          activeClubs,
          upcomingEvents: totalUpcomingEvents,
          growthRate: growthRate.toFixed(1),
          recentActivities: {
            clubs: recentClubs.map(club => ({
              _id: club._id,
              clubName: club.clubName,
              createdAt: (club._id as mongoose.Types.ObjectId).getTimestamp().toISOString(),
            })),
            events: recentEvents.map(event => ({
              _id: event._id,
              eventName: event.eventTitle,
              createdAt: (event._id as mongoose.Types.ObjectId).getTimestamp().toISOString(),
            })),
          },
          upcomingEventsDetails: [
            ...upcomingEventsDetails,
            ...upcomingCocaEventsDetails,
          ].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()).slice(0, 3),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching dashboard stats", error);
    return NextResponse.json(
      {
        status: "Failed",
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
