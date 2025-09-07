# CostCutter Products

A modern web application for CostCutter grocery store where customers can search and vote for products they'd like the store to add to their inventory.

## Features

- **Product Search**: Search through existing products by name or description
- **Category Filtering**: Filter products by category (Produce, Bakery, Dairy, Grains, Pantry)
- **Product Voting**: Vote for products you'd like to see in the store
- **Request New Products**: Suggest new products that aren't currently available
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful Material-UI design with smooth animations

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Icons**: Lucide React
- **Styling**: CSS with Material-UI's styling system
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd costcutter-products
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)

## Project Structure

```
src/
├── components/
│   ├── ProductSearch.tsx      # Search and filter functionality
│   ├── ProductList.tsx        # Product grid display
│   └── VotingSection.tsx     # New product request dialog
├── App.tsx                   # Main application component
├── App.css                   # Custom styles
└── index.tsx                 # Application entry point
```

## Features in Detail

### Product Search
- Real-time search through product names and descriptions
- Category-based filtering
- Clear search functionality

### Product Voting
- One-click voting system
- Visual feedback for voted products
- Vote count display

### Request New Products
- Modal dialog for product requests
- Category selection
- Form validation
- Automatic addition to product list

### Responsive Design
- Mobile-first approach
- Grid layout adapts to screen size
- Touch-friendly interface

## Customization

### Adding New Categories
To add new product categories, update the `categories` array in `App.tsx`:

```typescript
const categories = ['All', 'Produce', 'Bakery', 'Dairy', 'Grains', 'Pantry', 'NewCategory'];
```

### Modifying Product Data
Sample products are defined in `App.tsx`. You can modify the `sampleProducts` array to add, remove, or update products.

### Styling
The application uses Material-UI's theming system. You can customize colors, typography, and other design elements by modifying the `theme` object in `App.tsx`.

## Future Enhancements

- Backend integration for persistent data storage
- User authentication and profiles
- Product images upload
- Admin dashboard for store management
- Email notifications for popular products
- Social sharing features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
