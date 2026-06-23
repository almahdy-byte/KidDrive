import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { userModel } from './src/db/models/userModel/user.model';
import { VehicleModel } from './src/db/models/vehicleModel/vehicle.model';
import { TripModel } from './src/db/models/tripModel/trip.model';
import { DriverModel } from './src/db/models/driverModel/driver.model';
import { ChildModel } from './src/db/models/childModel/child.model';
import { SubscriptionModel } from './src/db/models/subscriptionModel/subscription.model';
import { DriverApplicationModel } from './src/db/models/driverApplicationModel/driverApp.model';

const UNIFIED_PASSWORD = '123456';
const SALT_ROUNDS = 10;

const maleFirstNames = [
  'Ahmed', 'Mohamed', 'Mahmoud', 'Ali', 'Hassan', 'Hussein', 'Omar', 'Khaled',
  'Youssef', 'Amr', 'Tamer', 'Hany', 'Sherif', 'Ayman', 'Karim', 'Nader',
  'Sameh', 'Wael', 'Moustafa', 'Ibrahim', 'Gamal', 'Hesham', 'Kareem', 'Loay',
  'Magdy', 'Nabil', 'Raouf', 'Sami', 'Tarek', 'Ziad', 'Ashraf', 'Emad',
  'Fady', 'Islam', 'Maged', 'Naguib', 'Ramzy', 'Shady', 'Yehia', 'Adel',
  'Bassem', 'Ehab', 'Fathy', 'Hatem', 'Mohanad', 'Ramy', 'Safwat', 'Wagdy',
];

const femaleFirstNames = [
  'Fatma', 'Aisha', 'Mariam', 'Nour', 'Hala', 'Dina', 'Salma', 'Mona',
  'Laila', 'Nadia', 'Omnia', 'Reem', 'Sara', 'Yara', 'Amira', 'Heba',
  'Maha', 'Noha', 'Rania', 'Samar', 'Wafaa', 'Eman', 'Ghada', 'Hend',
  'Nahla', 'Ola', 'Rasha', 'Soha', 'Aya', 'Esraa', 'Hoda', 'Nourhan',
  'Passant', 'Shaimaa', 'Yasmin', 'Donia', 'Engy', 'Habiba', 'Kawthar',
  'Mennah', 'Nada', 'Radwa', 'Tasneem', 'Zeinab',
];

const lastNames = [
  'Ali', 'Hassan', 'Mohamed', 'Ahmed', 'Ibrahim', 'Youssef', 'Mahmoud',
  'Saleh', 'Ezzat', 'Fahmy', 'Shaker', 'Mansour', 'Naguib', 'Kamel',
  'Rashid', 'Tawfik', 'Ghaly', 'Hany', 'Khalil', 'Labib', 'Mounir',
  'Nasser', 'Raouf', 'Sadek', 'Wahba', 'Zaki', 'El-Sayed', 'Badr',
  'Diab', 'Farouk', 'Hegazy', 'Khattab', 'Lotfy', 'Nawar', 'Riad',
  'Sakr', 'Zidan',
];

const cities = ['Cairo', 'Giza', 'Alexandria'];
const areas: Record<string, string[]> = {
  Cairo: ['Maadi', 'Heliopolis', 'Zamalek', 'Nasr City', 'New Cairo', 'Rehab', 'Madinaty', 'Shorouk', 'Tagamoa', 'Abbaseya'],
  Giza: ['Dokki', 'Mohandessin', 'Agouza', 'Haram', 'Faisal', '6th October', 'Sheikh Zayed'],
  Alexandria: ['Smouha', 'Sidi Bishr', 'Stanley', 'San Stefano', 'Miami', 'Louran', 'Bolkly', 'Roshdy'],
};

const carModels = [
  'Toyota Corolla', 'Toyota Yaris', 'Hyundai Elantra', 'Hyundai Accent',
  'Kia Cerato', 'Kia Rio', 'Nissan Sunny', 'Nissan Sentra',
  'Chevrolet Optra', 'Honda Civic', 'Mitsubishi Lancer', 'Mitsubishi Attrage',
  'BMW X3', 'Mercedes C200',
];

const carColors = ['White', 'Silver', 'Black', 'Blue', 'Red', 'Gray', 'Dark Blue', 'Beige'];

const schools = [
  'Future International School', 'Egyptian British School', 'American International School',
  'Al-Farouk Islamic School', 'Al-Salam School', 'Smart Village School',
  'British International College', 'New Cairo British School',
  'El Alsson School', 'Modern American International School',
  'Orouba Language School', 'Valley School', 'Sudan International School',
  'Manarat Hegazy School', 'Al Andalus School',
];

const childMaleNames = ['Youssef', 'Omar', 'Ali', 'Hassan', 'Karim', 'Ziad', 'Adam', 'Yehia', 'Faris', 'Nour', 'Seif', 'Tarek', 'Kareem'];
const childFemaleNames = ['Salma', 'Laila', 'Nour', 'Hana', 'Mariam', 'Farida', 'Jana', 'Donia', 'Habiba', 'Yasmin', 'Nadine', 'Lina', 'Sama'];

const usedPhones = new Set<string>();
const usedNationalIds = new Set<string>();
const usedPlateNumbers = new Set<string>();

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 6): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generatePhone(): string {
  const prefixes = ['010', '011', '012', '015'];
  let phone: string;
  do {
    phone = randomItem(prefixes) + randomInt(10000000, 99999999).toString();
  } while (usedPhones.has(phone));
  usedPhones.add(phone);
  return phone;
}

function generateNationalId(): string {
  let id: string;
  do {
    const year = randomInt(80, 99);
    const month = randomInt(1, 12).toString().padStart(2, '0');
    const day = randomInt(1, 28).toString().padStart(2, '0');
    id = '2' + year + month + day + randomInt(1000000, 9999999).toString();
  } while (usedNationalIds.has(id));
  usedNationalIds.add(id);
  return id;
}

function generatePlateNumber(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let plate: string;
  do {
    plate = letters.charAt(randomInt(0, 25)) + letters.charAt(randomInt(0, 25)) + letters.charAt(randomInt(0, 25)) + ' ' + randomInt(1000, 9999);
  } while (usedPlateNumbers.has(plate));
  usedPlateNumbers.add(plate);
  return plate;
}

async function seedDatabase() {
  const MONGO_URI = process.env.DB_URI || 'mongodb://localhost:27017/kiddrive';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    userModel.deleteMany({}),
    DriverModel.deleteMany({}),
    ChildModel.deleteMany({}),
    VehicleModel.deleteMany({}),
    DriverApplicationModel.deleteMany({}),
    SubscriptionModel.deleteMany({}),
    TripModel.deleteMany({}),
  ]);
  console.log('Cleared all existing data');

  const hashedPassword = bcrypt.hashSync(UNIFIED_PASSWORD, SALT_ROUNDS);

  // --- 1. Admin ---
  const admin = await userModel.create({
    firstName: 'Admin',
    lastName: 'KidDrive',
    fullName: 'Admin KidDrive',
    email: 'admin@kiddrive.com',
    password: hashedPassword,
    phone: '01000000000',
    role: 'admin',
    isVerified: true,
    location: { latitude: 30.0444, longitude: 31.2357, address: 'Cairo, Egypt', city: 'Cairo' },
  });
  console.log('Created admin: admin@kiddrive.com');

  // --- 2. Parents (100) ---
  const parents: any[] = [];
  for (let i = 0; i < 100; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = isMale ? randomItem(maleFirstNames) : randomItem(femaleFirstNames);
    const lastName = randomItem(lastNames);
    const city = randomItem(cities);
    const area = randomItem(areas[city] || ['Unknown']);

    const parent = await userModel.create({
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: `parent${i + 1}@test.com`,
      password: hashedPassword,
      phone: generatePhone(),
      role: 'parent',
      isVerified: true,
      location: {
        latitude: randomFloat(29.8, 30.3),
        longitude: randomFloat(31.0, 31.5),
        address: `${area}, ${city}`,
        city,
        department: area,
      },
    });
    parents.push(parent);
  }
  console.log(`Created ${parents.length} parents`);

  // --- 3. Children (2 per parent = 200) ---
  const children: any[] = [];
  for (const parent of parents) {
    for (let c = 0; c < 2; c++) {
      const isMale = Math.random() > 0.5;
      const name = isMale ? randomItem(childMaleNames) : randomItem(childFemaleNames);
      const school = randomItem(schools);

      const child = await ChildModel.create({
        name,
        age: randomInt(5, 14),
        gender: isMale ? 'male' : 'female',
        parentId: parent._id,
        school,
        schoolLocation: {
          latitude: randomFloat(29.9, 30.2),
          longitude: randomFloat(31.1, 31.4),
          address: school,
        },
        schedule: {
          arriveTime: '07:30',
          backHome: '14:00',
        },
      });
      children.push(child);
    }
  }
  console.log(`Created ${children.length} children`);

  // --- 4. Drivers (200) ---
  const drivers: any[] = [];
  for (let i = 0; i < 200; i++) {
    const firstName = randomItem(maleFirstNames);
    const lastName = randomItem(lastNames);
    const city = randomItem(cities);
    const area = randomItem(areas[city] || ['Unknown']);
    const isApproved = Math.random() > 0.3;

    const driver = await DriverModel.create({
      userName: `${firstName} ${lastName}`,
      email: `driver${i + 1}@test.com`,
      password: hashedPassword,
      phone: generatePhone(),
      nationalId: generateNationalId(),
      licenseNumber: `LIC-${randomInt(10000, 99999)}`,
      licenseImage: { public_id: `licenses/${i + 1}`, secure_url: `https://res.cloudinary.com/example/licenses/${i + 1}.jpg` },
      nationalIdImage: { public_id: `nids/${i + 1}`, secure_url: `https://res.cloudinary.com/example/nids/${i + 1}.jpg` },
      profilePhoto: { public_id: `profiles/${i + 1}`, secure_url: `https://res.cloudinary.com/example/profiles/${i + 1}.jpg` },
      isApproved,
      rating: { average: parseFloat((Math.random() * 2 + 3).toFixed(1)), count: randomInt(0, 50) },
      location: {
        city,
        department: area,
        latitude: randomFloat(29.8, 30.3),
        longitude: randomFloat(31.0, 31.5),
        address: `${area}, ${city}`,
      },
    });
    drivers.push(driver);
  }
  console.log(`Created ${drivers.length} drivers`);

  // --- 5. Vehicles (1 per driver = 200) ---
  const vehicles: any[] = [];
  for (const driver of drivers) {
    const vehicle = await VehicleModel.create({
      driver: driver._id,
      carModel: randomItem(carModels),
      plateNumber: generatePlateNumber(),
      carColor: randomItem(carColors),
      governmentDocuments: [
        { public_id: `docs/${driver._id}/1`, secure_url: `https://res.cloudinary.com/example/docs/${driver._id}/1.jpg` },
        { public_id: `docs/${driver._id}/2`, secure_url: `https://res.cloudinary.com/example/docs/${driver._id}/2.jpg` },
      ],
      status: 'approved',
      isApproved: true,
      location: {
        latitude: randomFloat(29.8, 30.3),
        longitude: randomFloat(31.0, 31.5),
        address: driver.location.address || '',
      },
    });
    vehicles.push(vehicle);
  }
  console.log(`Created ${vehicles.length} vehicles`);

  // --- 6. Driver Applications (1 per driver = 200) ---
  let appCount = 0;
  for (let i = 0; i < drivers.length; i++) {
    await DriverApplicationModel.create({
      driver: drivers[i]._id,
      vehicle: vehicles[i]._id,
      status: drivers[i].isApproved ? 'approved' : randomItem(['pending', 'rejected']),
    });
    appCount++;
  }
  console.log(`Created ${appCount} driver applications`);

  // --- 7. Subscriptions (~2 per child = ~400) ---
  const subscriptions: any[] = [];
  for (const child of children) {
    const parent = parents.find(p => p._id.toString() === child.parentId.toString());
    if (!parent) continue;

    const numSubs = randomInt(1, 2);
    const usedDriverIds = new Set<string>();

    for (let s = 0; s < numSubs; s++) {
      let driver: any;
      let attempts = 0;
      do {
        driver = randomItem(drivers);
        attempts++;
      } while (usedDriverIds.has(driver._id.toString()) && attempts < 100);
      if (!driver) continue;
      usedDriverIds.add(driver._id.toString());

      const numDays = randomInt(3, 5);
      const shuffledDays = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5).slice(0, numDays);
      const schedulePattern = shuffledDays.map(day => ({
        dayOfWeek: day,
        pickupTime: `${randomInt(6, 8)}:${randomItem(['00', '15', '30', '45'])}`,
        dropoffTime: `${randomInt(13, 16)}:${randomItem(['00', '15', '30', '45'])}`,
      }));

      const subType = Math.random() > 0.5 ? 'monthly' : 'term';
      const r = Math.random();
      const status = r < 0.7 ? 'accepted subscription'
        : r < 0.85 ? 'waiting for confirmation'
        : r < 0.95 ? 'canceled'
        : 'rejected subscription';

      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + randomInt(1, 6));

      const originLat = parent.location?.latitude || 30.0;
      const originLng = parent.location?.longitude || 31.2;
      const originAddr = parent.location?.address || 'Cairo';

      const sub = await SubscriptionModel.create({
        driverId: driver._id,
        parentId: parent._id,
        childId: child._id,
        expiryDate: expiry,
        status,
        subscriptionType: subType,
        schedulePattern,
        schedule: [],
        origin: { latitude: originLat, longitude: originLng, address: originAddr },
        destination: {
          latitude: (child.schoolLocation && child.schoolLocation.latitude) || 30.0,
          longitude: (child.schoolLocation && child.schoolLocation.longitude) || 31.2,
          address: child.school || 'School',
        },
      });
      subscriptions.push(sub);
    }
  }
  console.log(`Created ${subscriptions.length} subscriptions`);

  // --- 8. Trips (from subscriptions, 2 weeks worth = many) ---
  const today = new Date();
  const todayDay = today.getDay();
  let tripCount = 0;

  for (const sub of subscriptions) {
    if (!sub.schedulePattern || sub.schedulePattern.length === 0) continue;

    for (let week = 0; week < 2; week++) {
      for (const pattern of sub.schedulePattern) {
        let diff = pattern.dayOfWeek - todayDay;
        if (diff < 0) diff += 7;
        diff += week * 7;

        const date = new Date(today);
        date.setDate(today.getDate() + diff);
        date.setHours(0, 0, 0, 0);

        const isPast = date < today;

        for (const tripType of ['pickup', 'dropoff'] as const) {
          const time = tripType === 'pickup' ? pattern.pickupTime : pattern.dropoffTime;

          let status: string;
          if (isPast) {
            const s = Math.random();
            status = s < 0.4 ? 'trip_finished'
              : s < 0.65 ? 'trip_started'
              : s < 0.8 ? 'child_dropped_off'
              : s < 0.9 ? 'child_boarded'
              : 'idle';
          } else {
            status = 'idle';
          }

          await TripModel.create({
            driverId: sub.driverId,
            parentId: sub.parentId,
            childId: sub.childId,
            subscriptionId: sub._id,
            origin: sub.origin,
            destination: sub.destination,
            status,
            tripType,
            scheduledDate: date,
            scheduledTime: time,
            dayOfWeek: pattern.dayOfWeek,
          });
          tripCount++;
        }
      }
    }
  }
  console.log(`Created ${tripCount} trips`);

  // --- Summary ---
  console.log('\n==================== Seed Summary ====================');
  console.log(`Admin:              1`);
  console.log(`Parents:            ${parents.length}`);
  console.log(`Children:           ${children.length}`);
  console.log(`Drivers:            ${drivers.length}`);
  console.log(`Vehicles:           ${vehicles.length}`);
  console.log(`Driver Applications: ${appCount}`);
  console.log(`Subscriptions:      ${subscriptions.length}`);
  console.log(`Trips:              ${tripCount}`);
  console.log(`\nUnified password for ALL accounts: ${UNIFIED_PASSWORD}`);
  console.log(`Admin email: admin@kiddrive.com`);
  console.log(`Parent emails: parent1@test.com ... parent100@test.com`);
  console.log(`Driver emails: driver1@test.com ... driver200@test.com`);
  console.log('======================================================');

  await mongoose.disconnect();
  process.exit(0);
}

seedDatabase().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
