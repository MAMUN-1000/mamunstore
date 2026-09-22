import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean up existing data in reverse order of foreign key dependencies
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned up existing database tables.');

  // 2. Hash passwords for seed users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('adminpassword123', salt);
  const customerPasswordHash = await bcrypt.hash('password123', salt);

  // 3. Seed Users (1 Admin, 1 Customer)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Store Admin',
      email: 'admin@ecommerce.com',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: 'Jane Customer',
      email: 'customer@example.com',
      password: customerPasswordHash,
      role: 'CUSTOMER',
    },
  });

  console.log(`👤 Users seeded:`);
  console.log(`   - Admin: ${adminUser.email} (Password: adminpassword123)`);
  console.log(`   - Customer: ${customerUser.email} (Password: password123)`);

  // 4. Seed Categories
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Laptops, keyboards, monitors, and modern desk setups',
    },
  });

  const audioCategory = await prisma.category.create({
    data: {
      name: 'Audio & Gear',
      slug: 'audio-gear',
      description: 'Headphones, microphones, and studio audio gear',
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Bags, sleeves, cables, and daily essentials',
    },
  });

  console.log('🏷️  Categories seeded (Electronics, Audio & Gear, Accessories)');

  // 5. Seed Products
  const sampleProducts = [
    {
      name: 'Pro Wireless Noise-Cancelling Headphones',
      slug: 'pro-wireless-noise-cancelling-headphones',
      description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear acoustic fidelity.',
      price: 199.99,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      categoryId: audioCategory.id,
    },
    {
      name: 'Mechanical RGB Gaming Keyboard',
      slug: 'mechanical-rgb-gaming-keyboard',
      description: 'Tactile mechanical switches with customizable per-key RGB backlighting and durable aircraft-grade aluminum frame.',
      price: 89.99,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
      categoryId: electronicsCategory.id,
    },
    {
      name: 'Ultra-Slim 4K External Monitor 27-inch',
      slug: 'ultra-slim-4k-external-monitor-27-inch',
      description: 'Vibrant IPS display with 99% sRGB color accuracy, ultra-thin bezels, and USB-C single cable power delivery.',
      price: 349.99,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
      categoryId: electronicsCategory.id,
    },
    {
      name: 'Ergonomic Vertical Wireless Mouse',
      slug: 'ergonomic-vertical-wireless-mouse',
      description: 'Natural handshake position designed to reduce wrist strain and muscle fatigue during long working hours.',
      price: 49.99,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
      categoryId: electronicsCategory.id,
    },
    {
      name: 'Minimalist Leather Laptop Sleeve',
      slug: 'minimalist-leather-laptop-sleeve',
      description: 'Handcrafted genuine leather sleeve with soft microfiber interior lining. Fits 13 to 15 inch laptops.',
      price: 39.99,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
      categoryId: accessoriesCategory.id,
    },
    {
      name: 'USB-C Multiport Hub Adapter 7-in-1',
      slug: 'usb-c-multiport-hub-adapter-7-in-1',
      description: 'Expand your laptop with 4K HDMI, 3x USB 3.0 ports, SD/MicroSD card reader, and 100W Power Delivery charging.',
      price: 29.99,
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&auto=format&fit=crop&q=80',
      categoryId: accessoriesCategory.id,
    },
  ];

  for (const product of sampleProducts) {
    await prisma.product.create({ data: product });
  }

  console.log(`📦 Seeded ${sampleProducts.length} sample products.`);
  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
