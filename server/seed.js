const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Bookings');

dotenv.config();

const users = [
    { name: 'Admin User', email: 'admin@gmail.com', password: 'password123', role: 'admin' },
    { name: 'Demo User', email: 'user@gmail.com', password: 'password123', role: 'user' },
    { name: 'Alice Smith', email: 'alice@gmail.com', password: 'password123', role: 'user' },
    { name: 'Bob Johnson', email: 'bob@gmail.com', password: 'password123', role: 'user' },
    { name: 'Charlie Dave', email: 'charlie@gmail.com', password: 'password123', role: 'user' },
    { name: 'Diana Prince', email: 'diana@gmail.com', password: 'password123', role: 'user' },
    { name: 'Ethan Hunt', email: 'ethan@gmail.com', password: 'password123', role: 'user' },
    { name: 'Fiona Gallagher', email: 'fiona@gmail.com', password: 'password123', role: 'user' },
    { name: 'George Miller', email: 'george@gmail.com', password: 'password123', role: 'user' },
    { name: 'Hannah Montana', email: 'hannah@gmail.com', password: 'password123', role: 'user' }
];

const events = [
    {
        title: 'Aarohan 2026',
        description: 'The annual college cultural fest featuring dance, music, fashion, theatre, and exciting competitions between colleges.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: 'Punjab University Campus, Chandigarh',
        category: 'Cultural Fest',
        totalSeats: 500,
        ticketPrice: 300,
        imageUrl: 'https://images.shiksha.com/mediadata/images/articles/1490877207php35Znzn.jpeg'
    },

    {
        title: 'RHYTHM 2026',
        description: 'An electrifying inter-college music and dance festival featuring live performances, battles, DJ nights, and open mic sessions.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Student Centre, Chandigarh',
        category: 'Music & Dance',
        totalSeats: 800,
        ticketPrice: 500,
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
    },

    {
        title: 'TECHNOVISTA 2026',
        description: 'A college tech fest packed with coding challenges, robotics, gaming tournaments, hackathons, and exciting technical competitions.',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        location: 'University Auditorium, Chandigarh',
        category: 'Tech Fest',
        totalSeats: 400,
        ticketPrice: 250,
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800'
    },

    {
        title: 'MOSAIC 2026',
        description: 'A vibrant celebration of art and creativity with painting, photography, street art, fashion shows, and creative exhibitions.',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        location: 'College Main Ground, Chandigarh',
        category: 'Arts & Creativity',
        totalSeats: 300,
        ticketPrice: 200,
        imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=800'
    },

    {
        title: 'CAMPUS CARNIVAL 2026',
        description: 'The ultimate college carnival with food stalls, games, competitions, live performances, and a massive closing celebration.',
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        location: 'University Sports Ground, Chandigarh',
        category: 'College Fest',
        totalSeats: 1000,
        ticketPrice: 150,
        imageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&q=80&w=800'
    },

    {
        title: 'BATTLE OF BANDS 2026',
        description: 'Watch the best college bands battle it out on stage with live rock, indie, pop, and alternative performances.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: 'Open Air Theatre, Chandigarh',
        category: 'Music',
        totalSeats: 600,
        ticketPrice: 400,
        imageUrl: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&q=80&w=800'
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n✅ MongoDB connection open...');

        await User.deleteMany();
        await Event.deleteMany();
        await Booking.deleteMany();
        console.log('🗑️  Cleared existing data.');

        // Hash user passwords
        const salt = await bcrypt.genSalt(10);
        const hashedUsers = users.map(u => ({
            ...u,
            password: bcrypt.hashSync(u.password, salt),
            isVerified: true
        }));

        const createdUsers = await User.insertMany(hashedUsers);
        const adminUser = createdUsers.find(u => u.role === 'admin');
        const normalUsers = createdUsers.filter(u => u.role === 'user');
        console.log(`👤 Created ${createdUsers.length} total dummy users.`);

        // Link events to admin
        const eventsWithAdmin = events.map(e => ({
            ...e,
            availableSeats: e.totalSeats,
            createdBy: adminUser._id
        }));

        const createdEvents = await Event.insertMany(eventsWithAdmin);
        console.log(`🎉 Created ${createdEvents.length} distinct events with Unsplash images.`);

        // Generate Bookings Data
        const bookingsData = [];

        for (const event of createdEvents) {
            // Assign 3-6 random users to each event
            const randomCount = Math.floor(Math.random() * 4) + 3;
            // Shuffle and pick random users
            const shuffledUsers = [...normalUsers].sort(() => 0.5 - Math.random());
            const selectedUsers = shuffledUsers.slice(0, randomCount);

            for (const user of selectedUsers) {
                // Randomize statuses
                const statuses = ['pending', 'confirmed', 'cancelled'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                let paymentStatus = 'not_paid';
                if (status === 'confirmed' && event.ticketPrice > 0) {
                    // Usually confirmed tickets are marked paid (90% of the time)
                    paymentStatus = Math.random() > 0.1 ? 'paid' : 'not_paid';
                } else if (event.ticketPrice === 0) {
                    paymentStatus = 'paid';
                }

                bookingsData.push({
                    userId: user._id,
                    eventId: event._id,
                    status: status,
                    paymentStatus: paymentStatus,
                    amount: event.ticketPrice
                });

                // Deduct available seats specifically for confirmed tickets!
                if (status === 'confirmed') {
                    event.availableSeats -= 1;
                    await event.save();
                }
            }
        }

        await Booking.insertMany(bookingsData);
        console.log(`🎫 Inserted ${bookingsData.length} randomized dummy bookings (confirmed, pending, cancelled, paid, not_paid).`);

        console.log('\n🚀 Database seeded successfully!');
        console.log('-------------------------------------------');
        console.log('Admin Email: admin@gmail.com');
        console.log('User Email:  user@gmail.com');
        console.log('Password for all users: password123');
        console.log('-------------------------------------------\n');

        process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedDatabase();