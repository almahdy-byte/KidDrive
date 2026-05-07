import { TripModel, ITrip } from "../../../db/models/tripModel/trip.model";
import { ISubscription, IScheduleItem } from "../../../db/models/subscriptionModel/subscription.model";

export class TripGeneratorService {
  /**
   * Generate trips from a subscription schedule
   * Creates 2 trips per scheduled day (1 pickup + 1 dropoff)
   * 
   * @param subscription - The subscription object with schedule
   * @param startDate - Start date for trip generation (defaults to today)
   * @param endDate - End date for trip generation (defaults to subscription expiryDate)
   * @returns Array of generated trips
   */
  async generateTripsFromSubscription(
    subscription: ISubscription,
    startDate?: Date,
    endDate?: Date
  ): Promise<ITrip[]> {
    const generatedTrips: ITrip[] = [];
    
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date(subscription.expiryDate);
    end.setHours(23, 59, 59, 999);
    
    // Get days from schedule pattern
    const scheduledDays = subscription.schedulePattern.map((s) => s.dayOfWeek);
    
    // Iterate through each day from start to end
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Check if this day is in the schedule pattern
      if (scheduledDays.includes(dayOfWeek)) {
        const scheduleItem = subscription.schedulePattern.find((s) => s.dayOfWeek === dayOfWeek);
        
        if (scheduleItem) {
          // Generate pickup trip (home to school)
          const pickupTrip = await this.createTrip(
            subscription,
            currentDate,
            scheduleItem.pickupTime,
            'pickup',
            dayOfWeek
          );
          if (pickupTrip) {
            generatedTrips.push(pickupTrip);
          }
          
          // Generate dropoff trip (school to home)
          const dropoffTrip = await this.createTrip(
            subscription,
            currentDate,
            scheduleItem.dropoffTime,
            'dropoff',
            dayOfWeek
          );
          if (dropoffTrip) {
            generatedTrips.push(dropoffTrip);
          }
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return generatedTrips;
  }
  
  /**
   * Create a single trip
   */
  private async createTrip(
    subscription: ISubscription,
    scheduledDate: Date,
    scheduledTime: string,
    tripType: 'pickup' | 'dropoff',
    dayOfWeek: number
  ): Promise<ITrip | null> {
    try {
      // Clone dates to avoid mutating the original
      const dateStart = new Date(scheduledDate);
      dateStart.setHours(0, 0, 0, 0);
      
      const dateEnd = new Date(scheduledDate);
      dateEnd.setHours(23, 59, 59, 999);
      
      // Check if trip already exists for this subscription, date, type, and time
      const existingTrip = await TripModel.findOne({
        subscriptionId: subscription._id,
        scheduledDate: {
          $gte: dateStart,
          $lt: dateEnd,
        },
        tripType,
        scheduledTime,
      } as any);
      
      if (existingTrip) {
        // Trip already exists, skip
        return null;
      }
      
      // Determine origin and destination based on trip type
      const origin = tripType === 'pickup' ? subscription.origin : subscription.destination;
      const destination = tripType === 'pickup' ? subscription.destination : subscription.origin;
      
      const tripData: Partial<ITrip> = {
        driverId: subscription.driverId,
        parentId: subscription.parentId,
        childId: subscription.childId,
        subscriptionId: subscription._id,
        origin,
        destination,
        status: 'trip_started',
        tripType,
        scheduledDate: dateStart,
        scheduledTime,
        dayOfWeek,
      };
      
      const trip = await TripModel.create(tripData);
      return trip;
    } catch (error) {
      console.error('Error creating trip:', error);
      return null;
    }
  }
  
  /**
   * Generate trips for today only
   */
  async generateTripsForToday(subscription: ISubscription): Promise<ITrip[]> {
    const today = new Date();
    return this.generateTripsFromSubscription(subscription, today, today);
  }
  
  /**
   * Generate trips for a date range
   */
  async generateTripsForDateRange(
    subscription: ISubscription,
    daysAhead: number = 7
  ): Promise<ITrip[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);
    
    return this.generateTripsFromSubscription(subscription, startDate, endDate);
  }
}

export const tripGeneratorService = new TripGeneratorService();
