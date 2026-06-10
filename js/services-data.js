/* ============================================================
   LOVELLE — Services Price List Data
   All prices in INR
   ============================================================ */

const SERVICES_DATA = [
    {
        category: 'NAILS',
        subcategories: [
            {
                title: 'Basic Nail Service',
                items: [
                    { name: 'Nail Cut & File', price: 150, gender: 'Unisex' },
                    { name: 'Nail Polish Only', price: 150, gender: 'Unisex' }
                ]
            },
            {
                title: 'Organic Mani/Pedi',
                items: [
                    { name: 'Organic Manicure', price: 550, gender: 'Unisex' },
                    { name: 'Organic Pedicure', price: 700, gender: 'Unisex' }
                ]
            },
            {
                title: 'Massage',
                items: [
                    { name: 'Foot Massage', price: 700, gender: 'Unisex' }
                ]
            },
            {
                title: 'Chocolate Mani/Pedi',
                items: [
                    { name: 'Chocolate Manicure', price: 650, gender: 'Unisex' },
                    { name: 'Chocolate Pedicure', price: 850, gender: 'Unisex' }
                ]
            },
            {
                title: 'Gel Services',
                items: [
                    { name: 'Gel Polish Application', price: 950, gender: 'Unisex' },
                    { name: 'French Gel Polish', price: 950, gender: 'Unisex' },
                    { name: 'Builder Gel Overlay + BIAB', price: 1100, gender: 'Unisex' },
                    { name: 'Gel Extensions Full Set', price: 3200, gender: 'Unisex' }
                ]
            },
            {
                title: 'Extensions',
                items: [
                    { name: 'French Nail Extension', price: 3400, gender: 'Unisex' },
                    { name: 'Acrylic Extension', price: 2800, gender: 'Unisex' },
                    { name: 'French Acrylic Extension', price: 4000, gender: 'Unisex' }
                ]
            },
            {
                title: 'Removal',
                items: [
                    { name: 'Removal of Extensions', price: 550, gender: 'Unisex' }
                ]
            }
        ]
    },
    {
        category: 'FACIAL',
        subcategories: [
            {
                title: 'Essential',
                items: [
                    { name: 'Fresh Cut Fruit Facial', price: 1150, gender: 'Unisex' },
                    { name: 'Pure Moist SS', price: 1350, gender: 'Unisex' },
                    { name: 'Pure Pore SS', price: 1350, gender: 'Unisex' }
                ]
            },
            {
                title: 'Whitening',
                items: [
                    { name: 'Chocolate Mint Facial', price: 2300, gender: 'Unisex' }
                ]
            },
            {
                title: 'Luxury',
                items: [
                    { name: 'Cryo Red Carpet Facial', price: 5000, gender: 'Unisex' }
                ]
            }
        ]
    },
    {
        category: 'SKIN',
        subcategories: [
            {
                title: 'Clean Up',
                items: [
                    { name: 'Essential Clean Up', price: 650, gender: 'Unisex' },
                    { name: 'Acne Clean Up', price: 800, gender: 'Unisex' },
                    { name: 'Whitening Clean Up', price: 1150, gender: 'Unisex' },
                    { name: 'Organic Clean Up — Dry Skin', price: 950, gender: 'Unisex' },
                    { name: 'Organic Clean Up — Acne Skin', price: 950, gender: 'Unisex' }
                ]
            }
        ]
    },
    {
        category: 'HAIR',
        subcategories: [
            {
                title: 'Men Haircut',
                items: [
                    { name: 'Hair Cut', price: 250, gender: 'Men' }
                ]
            },
            {
                title: 'Men Grooming',
                items: [
                    { name: 'Beard Shave', price: 150, gender: 'Men' },
                    { name: 'Beard Styling', price: 200, gender: 'Men' }
                ]
            },
            {
                title: 'Men Styling',
                items: [
                    { name: 'Shampoo & Styling', price: 150, gender: 'Men' }
                ]
            },
            {
                title: 'Kids',
                items: [
                    { name: 'Child Haircut', price: 200, gender: 'Unisex' }
                ]
            },
            {
                title: 'Women Haircut',
                items: [
                    { name: 'Hair Cut', price: 800, gender: 'Women' }
                ]
            },
            {
                title: 'Kids (Women\'s Section)',
                items: [
                    { name: 'Child Haircut', price: 400, gender: 'Unisex' }
                ]
            },
            {
                title: 'Styling',
                items: [
                    { name: 'Shampoo + Blow Dry', price: 500, gender: 'Women' },
                    { name: 'Shampoo', price: 250, gender: 'Women' },
                    { name: 'Ironing', price: 1200, gender: 'Women' },
                    { name: 'Tongs', price: 1200, gender: 'Women' },
                    { name: 'Updo', price: 1200, gender: 'Women' }
                ]
            },
            {
                title: 'Color',
                items: [
                    { name: 'Root Touch Up', price: 400, gender: 'Men' },
                    { name: 'Global Color', price: 900, gender: 'Men' },
                    { name: 'Inoa Roots', price: 1000, gender: 'Men' },
                    { name: 'Inoa Global', price: 1350, gender: 'Men' },
                    { name: 'Highlights', price: 4000, gender: 'Women' }
                ]
            },
            {
                title: 'Hair Spa',
                items: [
                    { name: 'Hair Spa', price: 1400, gender: 'Unisex' },
                    { name: 'Deep Nourishing Spa — Absolut Repair', price: 2500, gender: 'Unisex' }
                ]
            },
            {
                title: 'Scalp Treatment',
                items: [
                    { name: 'Loreal Scalp Soothing Treatment', price: 1800, gender: 'Unisex' },
                    { name: 'Dandruff Treatment', price: 1800, gender: 'Unisex' },
                    { name: 'Hair Fall Treatment', price: 1800, gender: 'Unisex' }
                ]
            },
            {
                title: 'Repair',
                items: [
                    { name: 'SOS Macadamia Botox Therapy', price: 2200, gender: 'Unisex' }
                ]
            },
            {
                title: 'Texture',
                items: [
                    { name: 'Rebonding / Straightening', price: 6800, gender: 'Unisex' },
                    { name: 'Nanoplastia', price: 6800, gender: 'Unisex' }
                ]
            },
            {
                title: 'Repair (Premium)',
                items: [
                    { name: 'Hair Botox', price: 5700, gender: 'Unisex' }
                ]
            }
        ]
    },
    {
        category: 'THREADING',
        subcategories: [
            {
                title: 'Face',
                items: [
                    { name: 'Eyebrow', price: 50, gender: 'Women' },
                    { name: 'Upper Lip', price: 30, gender: 'Women' },
                    { name: 'Chin', price: 30, gender: 'Women' },
                    { name: 'Eyebrow + Lip + Chin', price: 140, gender: 'Women' },
                    { name: 'Forehead', price: 50, gender: 'Women' },
                    { name: 'Full Face', price: 350, gender: 'Women' }
                ]
            }
        ]
    },
    {
        category: 'WAXING',
        subcategories: [
            {
                title: 'Milk Wax',
                items: [
                    { name: 'Full Arms', price: 550, gender: 'Women' },
                    { name: 'Full Legs', price: 650, gender: 'Women' },
                    { name: 'Half Legs', price: 550, gender: 'Women' },
                    { name: 'Stomach', price: 950, gender: 'Women' },
                    { name: 'Back', price: 950, gender: 'Women' },
                    { name: 'Full Body', price: 3550, gender: 'Women' }
                ]
            }
        ]
    },
    {
        category: 'MAKEUP',
        subcategories: [
            {
                title: 'Bridal',
                items: [
                    { name: 'Bridal Makeup', price: 10000, gender: 'Women' },
                    { name: 'Pre Bridal Package', price: 10000, gender: 'Women' }
                ]
            },
            {
                title: 'Makeup',
                items: [
                    { name: 'Party Makeup', price: 5500, gender: 'Women' },
                    { name: 'Trial Makeup', price: 2000, gender: 'Women' }
                ]
            }
        ]
    },
    {
        category: 'SKIN (DE-TAN)',
        subcategories: [
            {
                title: 'De-Tan',
                items: [
                    { name: 'Face Treatment', price: 650, gender: 'Unisex' },
                    { name: 'Hand Treatment', price: 1350, gender: 'Unisex' },
                    { name: 'Half Legs Treatment', price: 1150, gender: 'Unisex' },
                    { name: 'Feet Treatment', price: 550, gender: 'Unisex' },
                    { name: 'Under Arms Treatment', price: 400, gender: 'Unisex' },
                    { name: 'Round Neck Treatment', price: 700, gender: 'Unisex' },
                    { name: 'Back Tan Treatment', price: 1150, gender: 'Unisex' },
                    { name: 'Full Body', price: 3400, gender: 'Unisex' }
                ]
            }
        ]
    },
    {
        category: 'HEAD MASSAGE',
        subcategories: [
            {
                title: 'Head Massage',
                items: [
                    { name: 'Brillare Oil Massage', price: 650, gender: 'Unisex' },
                    { name: 'Aroma Oil Head Massage', price: 400, gender: 'Unisex' },
                    { name: 'Olive Oil Head Massage', price: 400, gender: 'Unisex' },
                    { name: 'Coconut Oil Head Massage', price: 400, gender: 'Unisex' }
                ]
            }
        ]
    }
];
