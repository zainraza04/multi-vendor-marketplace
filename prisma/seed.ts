import { PrismaClient, ProductStatus, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const password = 'Qwerty@123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const customers = [
    {
      email: 'customer.ava@market.local',
      firstName: 'Ava',
      lastName: 'Hassan',
    },
    {
      email: 'customer.ali@market.local',
      firstName: 'Ali',
      lastName: 'Riaz',
    },
    {
      email: 'customer.sara@market.local',
      firstName: 'Sara',
      lastName: 'Iqbal',
    },
  ];

  const vendors = [
    {
      email: 'vendor.urban@market.local',
      firstName: 'Bilal',
      lastName: 'Mehmood',
      stores: [
        {
          name: 'Urban Kicks',
          description: 'Streetwear shoes and everyday sneakers.',
          logoUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
        },
        {
          name: 'Trail Gear',
          description: 'Outdoor footwear and hiking essentials.',
          logoUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2',
        },
      ],
    },
    {
      email: 'vendor.tech@market.local',
      firstName: 'Noor',
      lastName: 'Khan',
      stores: [
        {
          name: 'Gadget Hub',
          description: 'Smart devices, audio, and accessories.',
          logoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
        },
      ],
    },
  ];

  const categories = [
    { name: 'Shoes', slug: 'shoes' },
    { name: 'Outdoor', slug: 'outdoor' },
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Accessories', slug: 'accessories' },
  ];

  for (const customer of customers) {
    await prisma.user.upsert({
      where: { email: customer.email },
      update: {
        password: hashedPassword,
        role: Role.CUSTOMER,
        isActive: true,
        profile: {
          upsert: {
            update: {
              firstName: customer.firstName,
              lastName: customer.lastName,
            },
            create: {
              firstName: customer.firstName,
              lastName: customer.lastName,
            },
          },
        },
      },
      create: {
        email: customer.email,
        password: hashedPassword,
        role: Role.CUSTOMER,
        isActive: true,
        profile: {
          create: {
            firstName: customer.firstName,
            lastName: customer.lastName,
          },
        },
      },
    });
  }

  for (const vendor of vendors) {
    const user = await prisma.user.upsert({
      where: { email: vendor.email },
      update: {
        password: hashedPassword,
        role: Role.VENDOR,
        isActive: true,
        profile: {
          upsert: {
            update: {
              firstName: vendor.firstName,
              lastName: vendor.lastName,
            },
            create: {
              firstName: vendor.firstName,
              lastName: vendor.lastName,
            },
          },
        },
      },
      create: {
        email: vendor.email,
        password: hashedPassword,
        role: Role.VENDOR,
        isActive: true,
        profile: {
          create: {
            firstName: vendor.firstName,
            lastName: vendor.lastName,
          },
        },
      },
      select: { id: true },
    });

    for (const store of vendor.stores) {
      const existingStore = await prisma.store.findFirst({
        where: {
          ownerId: user.id,
          name: store.name,
        },
        select: { id: true },
      });

      if (!existingStore) {
        await prisma.store.create({
          data: {
            name: store.name,
            description: store.description,
            logoUrl: store.logoUrl,
            ownerId: user.id,
          },
        });
      }
    }
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  const stores = await prisma.store.findMany({
    select: { id: true, name: true },
  });
  const categoryMap = await prisma.category.findMany({
    select: { id: true, slug: true },
  });

  const storeByName = new Map(stores.map((store) => [store.name, store.id]));
  const categoryBySlug = new Map(
    categoryMap.map((category) => [category.slug, category.id]),
  );

  const products = [
    {
      name: 'Velocity Runner',
      description: 'Lightweight running shoes with breathable mesh.',
      price: 89.99,
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      status: 'ACTIVE',
      storeName: 'Urban Kicks',
      categorySlug: 'shoes',
    },
    {
      name: 'Summit Trek Boots',
      description: 'Water-resistant hiking boots for rugged trails.',
      price: 129.5,
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      status: 'ACTIVE',
      storeName: 'Trail Gear',
      categorySlug: 'outdoor',
    },
    {
      name: 'Pulse Noise-Cancel Earbuds',
      description: 'Wireless earbuds with active noise cancellation.',
      price: 149.0,
      stock: 42,
      imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea',
      status: 'ACTIVE',
      storeName: 'Gadget Hub',
      categorySlug: 'electronics',
    },
    {
      name: 'Magnetic Charging Stand',
      description: 'Fast wireless charger with adjustable tilt.',
      price: 39.99,
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1496180727794-817822f65950',
      status: 'ACTIVE',
      storeName: 'Gadget Hub',
      categorySlug: 'accessories',
    },
  ];

  for (const product of products) {
    const storeId = storeByName.get(product.storeName);
    const categoryId = categoryBySlug.get(product.categorySlug);

    if (!storeId || !categoryId) {
      continue;
    }

    const existing = await prisma.product.findFirst({
      where: {
        name: product.name,
        storeId,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          description: product.description,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl,
          status: ProductStatus.ACTIVE,
          categoryId,
        },
      });
    } else {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl,
          status: ProductStatus.ACTIVE,
          storeId,
          categoryId,
        },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
