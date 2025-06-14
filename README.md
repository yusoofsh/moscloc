# Moscloc

A modern Islamic mosque management application built with React, TypeScript, and Tauri. Features prayer times, community events, Quran verses, announcements, and an Iqamah countdown timer.

## Features

### 🕌 Core Features
- **Prayer Times Display**: Accurate prayer times with customizable calculation methods
- **Islamic Calendar**: Hijri date display with current Islamic date
- **Quran Verses**: Daily rotating verses with Arabic text and translations
- **Community Events**: Event management system for mosque activities
- **Announcements**: Real-time announcements system
- **Mosque Information**: Customizable mosque details and contact information

### ⏰ Iqamah Countdown System
- **Automatic Countdown**: Shows countdown timer from Adhan to Iqamah
- **Configurable Intervals**: Set different waiting times for each prayer
- **Visual Display**: Beautiful full-screen countdown with mosque branding
- **Auto-detect**: Automatically detects when it's time for Iqamah
- **Multi-language**: Support for Indonesian and Arabic prayer names

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Islamic Design**: Beautiful Islamic-themed UI with geometric patterns
- **Dark/Light Themes**: Support for different visual themes
- **PWA Support**: Can be installed as a Progressive Web App
- **Tauri Desktop**: Native desktop application support

## Installation & Setup

### Prerequisites
- Node.js 18+
- Rust (for Tauri desktop app)
- npm or bun package manager

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd moscloc
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Access the application**
   - Web: `http://localhost:3002`
   - Admin Panel: `http://localhost:3002/admin`
   - Iqamah Page: `http://localhost:3002/iqamah`

### Building for Production

**Web Application:**
```bash
npm run build
npm run serve
```

**Desktop Application:**
```bash
npm run desktop:build
```

## Usage Guide

### Admin Panel Configuration

Access the admin panel at `/admin` to configure:

1. **Mosque Information**
   - Mosque name and address
   - Contact information
   - Geographic coordinates for prayer times

2. **Prayer Settings**
   - Calculation method (supports 15+ international methods)
   - Juristic school (Shafi/Hanafi)
   - Time adjustments and corrections
   - Timezone configuration

3. **Iqamah Intervals** ⭐ **NEW**
   - Set waiting time between Adhan and Iqamah for each prayer
   - Configure different intervals:
     - Subuh/Fajr: 15 minutes (default)
     - Dzuhur/Dhuhr: 10 minutes (default)
     - Ashar/Asr: 10 minutes (default)
     - Maghrib: 5 minutes (default)
     - Isya/Isha: 10 minutes (default)

4. **Content Management**
   - Announcements
   - Community events
   - Quran verses rotation

### Iqamah Countdown Feature

#### How it Works
1. **Automatic Detection**: The system automatically detects when it's time between Adhan and Iqamah
2. **Visual Countdown**: Shows a beautiful full-screen countdown timer
3. **Mosque Branding**: Displays mosque name, address, and prayer information
4. **Progress Indicator**: Visual progress bar showing time elapsed

#### Accessing Iqamah Page
- **Direct URL**: Navigate to `/iqamah`
- **Auto-redirect**: Can be configured to auto-redirect from main display
- **Manual Control**: Admin can manually open when needed

#### Display Information
- Current prayer name (e.g., "Menuju Iqamah Dzuhur")
- Countdown timer in MM:SS format
- Adhan time and Iqamah time
- Mosque information
- Progress bar visualization

#### States
- **No Active Iqamah**: Shows message when not in Iqamah period
- **Countdown Active**: Shows countdown timer with remaining time
- **Iqamah Time**: Shows "IQAMAH" message when time is reached

### Prayer Times API

The application uses the Aladhan API for accurate prayer times:
- Supports 15+ calculation methods worldwide
- Automatic timezone detection
- Custom tune parameters for local adjustments
- Supports both Shafi and Hanafi juristic schools

## Technical Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Routing**: TanStack Router with file-based routing
- **State Management**: React Context API
- **Desktop**: Tauri (Rust-based)
- **Build Tool**: Vite
- **PWA**: Vite PWA plugin
- **Linting**: Biome

### Project Structure
```
src/
├── components/          # React components
│   ├── IqamahCountdown.tsx    # Iqamah countdown display
│   ├── IqamahRedirect.tsx     # Auto-redirect component
│   ├── PrayerTimes.tsx        # Prayer times display
│   ├── AdminPanel.tsx         # Admin configuration
│   └── ...
├── contexts/           # React contexts
│   └── PrayerContext.tsx      # Prayer & Iqamah state
├── routes/            # File-based routing
│   ├── index.tsx             # Main display
│   ├── iqamah.tsx           # Iqamah countdown page
│   └── admin/               # Admin routes
├── services/          # API services
└── hooks/            # Custom React hooks
```

## Configuration Examples

### Sample Iqamah Configuration
```json
{
  "fajr": 15,     // 15 minutes after Fajr Adhan
  "dhuhr": 10,    // 10 minutes after Dhuhr Adhan
  "asr": 10,      // 10 minutes after Asr Adhan
  "maghrib": 5,   // 5 minutes after Maghrib Adhan
  "isha": 10      // 10 minutes after Isha Adhan
}
```

### Prayer Settings Example
```json
{
  "method": 20,                    // Custom method
  "school": 0,                     // Shafi school
  "tune": "10,10,-1,1,2,3,3,2,0", // Time adjustments
  "timezonestring": "Asia/Jakarta",
  "shafaq": "general"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Open an issue on GitHub
- Check the documentation
- Contact the development team

---

**Made with ❤️ for the Muslim community**
