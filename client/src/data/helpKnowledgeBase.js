/**
 * Centralized Knowledge Base & Customer Care Directory
 * Single source of truth for Help Center, FAQ page, and FAQ Chatbot.
 * All information is strictly bound to verified features implemented in the application.
 */

export const SUPPORT_CONFIG = {
  storeName: 'MamunStore',
  campusDesk: 'Jahangirnagar University, Savar, Dhaka - 1342',
  phone: '+880 1712-345678',
  email: 'support@internshipstore.bd',
  hours: 'Saturday – Thursday, 9:00 AM – 9:00 PM BST',
  freeShippingThresholdBDT: 10000,
  freeShippingThresholdUSD: 100,
};

export const HELP_CATEGORIES = [
  { id: 'orders', name: 'Orders', iconName: 'ShoppingBag', desc: 'Order placement, status meanings, and tracking' },
  { id: 'payments', name: 'Payments', iconName: 'CreditCard', desc: 'bKash, Nagad, Cash on Delivery, and cards' },
  { id: 'delivery', name: 'Delivery & Shipping', iconName: 'Truck', desc: 'JU Savar campus delivery and 8 divisions nationwide' },
  { id: 'returns', name: 'Returns & Refunds', iconName: 'RotateCcw', desc: 'Reporting damaged items and partial return assistance' },
  { id: 'account', name: 'Account & Login', iconName: 'User', desc: 'Registration, customer/admin sign-in, and security' },
  { id: 'products', name: 'Products & Inventory', iconName: 'Package', desc: 'Catalog search, stock availability, and filters' },
  { id: 'reviews', name: 'Reviews & Ratings', iconName: 'Star', desc: 'Verified buyer requirements and submitting ratings' },
  { id: 'care', name: 'Customer Care', iconName: 'Headphones', desc: 'Service desk location, support hours, and contact forms' },
];

export const FAQ_ENTRIES = [
  // --- ORDERS ---
  {
    id: 'ord-1',
    category: 'orders',
    question: 'How do I place an order?',
    answer: 'Browse products via our Catalog, add desired items to your Cart, and click "Proceed to Checkout". Enter your Bangladeshi delivery address (Division, District, City, and Address), choose your preferred payment method (bKash, Nagad, COD, or Card), and click "Confirm Order". You will immediately receive an order confirmation.',
    keywords: ['place order', 'how to buy', 'checkout', 'purchase', 'order item', 'cart to order'],
    actionLink: { text: 'Browse Products', url: '/products' },
  },
  {
    id: 'ord-2',
    category: 'orders',
    question: 'How do I track my order status?',
    answer: 'When signed into your account, click "My Orders" in the navigation bar or access "Orders" from your Profile page. You will see a complete list of your orders alongside current fulfillment statuses and delivery details.',
    keywords: ['track order', 'order status', 'where is my order', 'my orders', 'order history', 'view orders'],
    actionLink: { text: 'View My Orders', url: '/orders' },
  },
  {
    id: 'ord-3',
    category: 'orders',
    question: 'What do the order statuses mean?',
    answer: '• PENDING: Order placed successfully and awaiting store processing.\n• PROCESSING: Items are being picked and packaged from inventory.\n• SHIPPED: Order has been dispatched with a courier tracking number.\n• DELIVERED: Package has arrived at your address and delivery is verified.\n• CANCELLED: Order was cancelled prior to dispatch.',
    keywords: ['order status', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'status meaning'],
    actionLink: { text: 'View Orders', url: '/orders' },
  },
  {
    id: 'ord-4',
    category: 'orders',
    question: 'Can I cancel an order after placing it?',
    answer: 'Orders that are in PENDING status can be cancelled by reaching out to our Customer Care team before the package enters PROCESSING or SHIPPED status.',
    keywords: ['cancel order', 'cancel', 'stop order', 'change mind'],
    actionLink: { text: 'Contact Customer Care', url: '/customer-care' },
  },

  // --- PAYMENTS ---
  {
    id: 'pay-1',
    category: 'payments',
    question: 'What payment methods are supported?',
    answer: 'We support four payment methods: bKash (MFS Simulation), Nagad (MFS Simulation), Cash on Delivery (COD), and Debit/Credit Card simulation. All payment options are available during checkout.',
    keywords: ['payment methods', 'how to pay', 'bkash', 'nagad', 'cod', 'cash on delivery', 'card', 'payment options'],
    actionLink: { text: 'Go to Checkout', url: '/checkout' },
  },
  {
    id: 'pay-2',
    category: 'payments',
    question: 'How does Cash on Delivery (COD) work?',
    answer: 'With Cash on Delivery, you pay cash in Bangladeshi Taka (৳ BDT) directly to the delivery courier when your parcel arrives at your address. No advance payment is needed during checkout.',
    keywords: ['cod', 'cash on delivery', 'pay on delivery', 'cash'],
  },
  {
    id: 'pay-3',
    category: 'payments',
    question: 'How does bKash / Nagad payment work?',
    answer: 'When selecting bKash or Nagad at checkout, you enter your 11-digit Bangladeshi mobile account number (e.g. 017XXXXXXXX). The transaction is simulated and verified atomically, confirming your order instantly without leaving the site.',
    keywords: ['bkash', 'nagad', 'mfs', 'mobile payment', 'bKash number', 'nagad number'],
  },
  {
    id: 'pay-4',
    category: 'payments',
    question: 'What currencies are accepted?',
    answer: 'Our store lists prices primarily in Bangladeshi Taka (৳ BDT), with real-time US Dollar ($ USD) equivalents displayed across all products, cart totals, and invoices.',
    keywords: ['currency', 'bdt', 'taka', 'usd', 'dollar', 'exchange rate'],
  },

  // --- DELIVERY & SHIPPING ---
  {
    id: 'del-1',
    category: 'delivery',
    question: 'Where do you deliver in Bangladesh?',
    answer: 'We provide nationwide courier delivery across all 8 administrative divisions of Bangladesh: Dhaka, Chattogram, Rajshahi, Khulna, Barisal, Sylhet, Rangpur, and Mymensingh.',
    keywords: ['where do you deliver', 'delivery areas', 'coverage', 'bangladesh', 'divisions', 'nationwide'],
  },
  {
    id: 'del-2',
    category: 'delivery',
    question: 'Do you deliver to Jahangirnagar University (JU) and Savar?',
    answer: 'Yes! We offer specialized local campus delivery presets for Jahangirnagar University (JU) residential halls, academic departments, and surrounding Savar neighborhoods with expedited handling.',
    keywords: ['ju', 'jahangirnagar', 'savar', 'campus delivery', 'hall delivery', 'university'],
  },
  {
    id: 'del-3',
    category: 'delivery',
    question: 'How can I get free shipping?',
    answer: 'We offer free delivery on all orders totaling ৳10,000 ($100 USD) or more. For orders below this threshold, a standard regional delivery charge is applied at checkout.',
    keywords: ['free shipping', 'shipping fee', 'delivery charge', 'free delivery', 'cost of delivery'],
  },

  // --- RETURNS & REFUNDS ---
  {
    id: 'ret-1',
    category: 'returns',
    question: 'What is your return policy for damaged or defective items?',
    answer: 'If your product arrives damaged, defective, or incorrect, please contact Customer Care immediately with your Order ID, product details, and a brief description. Our support team will assist you with resolution.',
    keywords: ['return policy', 'damaged', 'defective', 'broken', 'wrong item', 'refund'],
    actionLink: { text: 'Customer Care Support', url: '/customer-care' },
  },
  {
    id: 'ret-2',
    category: 'returns',
    question: 'Can I return only specific items from my order (partial return)?',
    answer: 'Yes! Our support team handles partial returns for specific individual items from an order. You do not have to return the entire package if only one product has an issue.',
    keywords: ['partial return', 'return one item', 'individual item return', 'partial refund'],
    actionLink: { text: 'Inquire About Return', url: '/customer-care' },
  },

  // --- ACCOUNT & LOGIN ---
  {
    id: 'acc-1',
    category: 'account',
    question: 'How do I create a new customer account?',
    answer: 'Click "Create an Account" or "Sign Up" at the top right of any page. Fill in your full name, email address, and a secure password (minimum 6 characters), then submit to register.',
    keywords: ['create account', 'register', 'sign up', 'new user', 'registration'],
    actionLink: { text: 'Register Now', url: '/register' },
  },
  {
    id: 'acc-2',
    category: 'account',
    question: 'What is the difference between "Sign In as Customer" and "Sign In as Administrator"?',
    answer: 'Our login page features dedicated authentication actions: "Sign In as Customer" logs you in to browse, shop, and manage orders. "Sign In as Administrator" is reserved for store managers to access the admin portal; entering customer credentials there will appropriately restrict access.',
    keywords: ['sign in', 'login', 'admin sign in', 'customer sign in', 'separate buttons', 'admin login'],
    actionLink: { text: 'Go to Sign In', url: '/login' },
  },
  {
    id: 'acc-3',
    category: 'account',
    question: 'How is my account secured?',
    answer: 'Your passwords are encrypted using bcrypt hashing before storage in our PostgreSQL database. User sessions are maintained via secure HTTP-only cookies to protect against token theft and cross-site scripting.',
    keywords: ['security', 'password', 'cookies', 'privacy', 'safe'],
  },

  // --- PRODUCTS & INVENTORY ---
  {
    id: 'prd-1',
    category: 'products',
    question: 'How do I search and filter for products?',
    answer: 'You can use the prominent search bar on the homepage or the Catalog page. You can filter by category (Electronics, Accessories, Home & Office), filter by price range, search by keywords, and sort by Newest, Price (Low to High), or Price (High to Low).',
    keywords: ['search', 'filter', 'sort', 'find products', 'catalog', 'categories'],
    actionLink: { text: 'Explore Catalog', url: '/products' },
  },
  {
    id: 'prd-2',
    category: 'products',
    question: 'How do I know if a product is in stock?',
    answer: 'Live inventory counts are displayed directly on product cards and product details pages. If an item runs out of stock, it shows an "Out of Stock" badge and cannot be added to the cart.',
    keywords: ['in stock', 'out of stock', 'inventory', 'availability', 'how many left'],
  },
  {
    id: 'prd-3',
    category: 'products',
    question: 'Is stock reserved when I place an order?',
    answer: 'Yes. When an order is confirmed at checkout, product stock is decremented atomically inside a database transaction to ensure accurate inventory.',
    keywords: ['stock reservation', 'atomic', 'overselling'],
  },

  // --- REVIEWS & RATINGS ---
  {
    id: 'rev-1',
    category: 'reviews',
    question: 'Who can leave product reviews and ratings?',
    answer: 'Only Verified Buyers can leave reviews! You must have purchased the specific product in an order that has achieved DELIVERED status. This ensures 100% genuine customer feedback.',
    keywords: ['reviews', 'ratings', 'verified buyer', 'write review', 'who can review'],
  },
  {
    id: 'rev-2',
    category: 'reviews',
    question: 'How do I submit a product review?',
    answer: 'Navigate to the page of a product you purchased. Once your order status is marked as DELIVERED, you will see the active "Write a Review" section where you can select a 1 to 5 star rating and type your feedback.',
    keywords: ['submit review', 'how to review', 'star rating', 'give feedback'],
    actionLink: { text: 'View Products', url: '/products' },
  },

  // --- CUSTOMER CARE ---
  {
    id: 'care-1',
    category: 'care',
    question: 'How can I contact Customer Care directly?',
    answer: 'You can connect with us through multiple official channels:\n• Physical Desk: Jahangirnagar University, Savar, Dhaka - 1342\n• Phone: +880 1712-345678 (Sat–Thu, 9 AM – 9 PM BST)\n• Email: support@internshipstore.bd\n• Online Inquiry Form: Available on our Customer Care page.',
    keywords: ['contact care', 'contact customer care', 'support phone', 'support email', 'customer service', 'help desk'],
    actionLink: { text: 'Visit Customer Care', url: '/customer-care' },
  },
  {
    id: 'care-2',
    category: 'care',
    question: 'What are Customer Care operating hours?',
    answer: 'Our customer support team is available Saturday through Thursday from 9:00 AM to 9:00 PM (Bangladesh Standard Time). Inquiries submitted outside these hours are answered on the next business day.',
    keywords: ['hours', 'support hours', 'operating hours', 'when open', 'schedule'],
  },
];

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'they', 'them',
  'tell', 'give', 'show', 'can', 'do', 'does', 'did', 'please', 'write', 'make',
  'get', 'got', 'about', 'how', 'what', 'when', 'where', 'why', 'who', 'which'
]);

const GREETINGS = new Set([
  'hi', 'hello', 'hey', 'hola', 'assalamu alaikum', 'salam', 'good morning',
  'good afternoon', 'good evening', 'help'
]);

/**
 * Intelligent FAQ Matcher
 * Scores user query tokens against knowledge base questions, answers, and keywords.
 * Returns the best match if score passes threshold, otherwise returns null for safe fallback.
 */
export const matchFaqQuery = (userQuery) => {
  if (!userQuery || typeof userQuery !== 'string') return null;

  const normalized = userQuery.toLowerCase().trim();
  if (normalized.length < 2) return null;

  // Handle polite general greetings
  if (GREETINGS.has(normalized)) {
    return {
      isGreeting: true,
      entry: {
        question: 'Store Assistant Greeting',
        answer: 'Hello! How can I assist you today? You can ask me about our payment options (bKash, Nagad, COD), campus delivery to JU and Savar, order tracking, or product returns.',
        actionLink: { text: 'Browse Help Center', url: '/help' },
      },
      confidenceScore: 100,
    };
  }

  // Tokenize and strip punctuation
  const rawTokens = normalized
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  // Filter out English stopwords to avoid false-positive semantic drift
  const tokens = rawTokens.filter((t) => !STOP_WORDS.has(t));
  if (tokens.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;
  let matchingTokensCount = 0;

  for (const entry of FAQ_ENTRIES) {
    let score = 0;
    let matchedTokens = 0;
    const qLower = entry.question.toLowerCase();
    const qWords = qLower.replace(/[^\w\s]/gi, ' ').split(/\s+/);

    if (normalized === qLower) {
      score += 50;
      matchedTokens += 2;
    } else if (qLower.includes(normalized) && normalized.length > 5) {
      score += 30;
      matchedTokens += 2;
    }

    for (const kw of entry.keywords) {
      const kwLower = kw.toLowerCase();
      if (normalized === kwLower) {
        score += 40;
        matchedTokens += 2;
      } else if (normalized.includes(kwLower) && kwLower.length >= 4) {
        score += 25;
        matchedTokens += 1;
      } else {
        const kwWords = kwLower.split(/\s+/);
        for (const token of tokens) {
          if (kwWords.includes(token)) {
            score += 12;
            matchedTokens++;
          }
        }
      }
    }

    for (const token of tokens) {
      if (qWords.includes(token)) {
        score += 10;
        matchedTokens++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
      matchingTokensCount = matchedTokens;
    }
  }

  // Confidence threshold: Requires at least 20 points and at least 1 keyword/question match
  if (bestScore >= 20 && matchingTokensCount >= 1 && bestMatch) {
    return {
      entry: bestMatch,
      confidenceScore: bestScore,
    };
  }

  return null;
};
