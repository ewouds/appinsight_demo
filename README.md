# Application Insights PoC - Comprehensive Web Analytics Demo

![Application Insights](https://img.shields.io/badge/Azure-Application%20Insights-blue?logo=microsoft-azure) ![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js) ![License](https://img.shields.io/badge/License-MIT-yellow.svg)

A comprehensive **Proof of Concept** demonstrating modern web analytics and telemetry tracking using **Azure Application Insights**. This project showcases both client-side and server-side tracking with a complete dashboard for testing and demonstration.

## 🎯 Features

### 📊 Comprehensive Web Analytics

- **Session & Visitor Tracking**: New vs returning visitors, session duration
- **Page Analytics**: Page views, bounce rates, navigation patterns
- **User Journey**: Complete purchase funnel tracking
- **Performance Monitoring**: Page load times, API response times
- **Device & Browser Analytics**: Cross-platform usage insights

### 🔬 Advanced Analytics

- **A/B Testing Framework**: Variant tracking and conversion analysis
- **Cohort Analysis**: User retention and engagement metrics
- **Custom Events**: Business-specific event tracking
- **Real-time Metrics**: Live performance monitoring
- **Exception Tracking**: Error monitoring and diagnostics

### 🛠️ Technical Implementation

- **Azure Application Insights v3.0**: Latest SDK with OpenTelemetry support
- **Dual Tracking**: Client-side JavaScript + Server-side Node.js
- **Modern Architecture**: RESTful APIs with comprehensive logging
- **Error Handling**: Robust error management and fallback strategies

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **Azure subscription** with Application Insights resource
- **Application Insights connection string** (recommended) or instrumentation key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ewouds/appinsight_demo.git
   cd appinsight_demo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Application Insights**

   Create a `.env` file in the project root:

   ```env
   # Azure Application Insights Configuration
   APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=your-key;IngestionEndpoint=https://your-region.in.applicationinsights.azure.com/;LiveEndpoint=https://your-region.livediagnostics.monitor.azure.com/"

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the application**

   ```bash
   npm start
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
application-insights-poc/
├── server/
│   ├── server-simple.js      # Simplified server (recommended)
│   └── server.js             # Full-featured server
├── js/
│   └── analytics.js          # Client-side analytics implementation
├── docs/
│   ├── IMPLEMENTATION_GUIDE.md
│   └── TROUBLESHOOTING.md
├── index.html               # Interactive dashboard
├── package.json
├── .env.example            # Environment template
└── README.md
```

## 🎮 Demo Features

### Interactive Dashboard

The main dashboard (`http://localhost:3000`) provides:

- **🏠 Homepage Analytics**: Page view tracking and user interactions
- **🛒 Purchase Journey**: Complete e-commerce funnel simulation
- **🧪 A/B Testing**: Variant assignment and conversion tracking
- **📱 Device Analytics**: Browser and device information collection
- **👥 Cohort Analysis**: User retention and engagement metrics
- **⚡ Performance Monitoring**: Real-time performance metrics
- **🚨 Error Simulation**: Exception handling demonstration

### API Endpoints

| Endpoint                      | Method | Description                        |
| ----------------------------- | ------ | ---------------------------------- |
| `/api/config`                 | GET    | Application Insights configuration |
| `/api/health`                 | GET    | Server health and status           |
| `/api/track-event`            | POST   | Custom event tracking              |
| `/api/track-metric`           | POST   | Custom metric tracking             |
| `/api/purchase-journey/:step` | POST   | Purchase funnel tracking           |

## 📊 Data in Application Insights

### Events Tracked

- `HomePageAccess`, `ServerStartup`, `HealthCheck`
- `PurchaseJourney_*` (QuoteRequested, ApplicationStarted, etc.)
- `ABTest_VariantAssigned`, `ABTest_Conversion`
- `CohortAnalysis_*`, `DeviceInfo_Collected`

### Metrics Collected

- `ServerResponseTime`, `PageLoadTime`, `UserEngagement`
- Custom business metrics and performance counters

### Telemetry Features

- **Custom Properties**: User context, session data, device info
- **Exception Tracking**: Comprehensive error monitoring
- **Request Tracking**: HTTP request performance and success rates

## 🔧 Configuration Options

### Environment Variables

| Variable                                | Description                          | Required |
| --------------------------------------- | ------------------------------------ | -------- |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Full connection string (recommended) | Yes      |
| `APPINSIGHTS_INSTRUMENTATIONKEY`        | Alternative to connection string     | No       |
| `PORT`                                  | Server port (default: 3000)          | No       |
| `NODE_ENV`                              | Environment (development/production) | No       |

### Server Options

- **`server-simple.js`**: Simplified implementation, fewer OpenTelemetry conflicts
- **`server.js`**: Full-featured implementation with advanced telemetry

## 🎯 Implementation Highlights

### Modern Application Insights v3.0

- Uses latest JavaScript SDK with enhanced features
- Connection string configuration (modern approach)
- Telemetry initializers for user context
- Compatible with OpenTelemetry ecosystem

### Robust Error Handling

- Graceful degradation when Application Insights unavailable
- Comprehensive error logging and exception tracking
- Fallback strategies for network issues

### Performance Optimized

- Minimal auto-collection to avoid conflicts
- Manual tracking for better control
- Efficient telemetry batching and transmission

## 📖 Documentation

- **[Implementation Guide](docs/IMPLEMENTATION_GUIDE.md)**: Detailed technical implementation
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)**: Common issues and solutions

## 🛠️ Development

### Scripts

```bash
npm start          # Start production server (server-simple.js)
npm run start-full # Start full-featured server (server.js)
npm run dev        # Development mode with nodemon
```

### Adding Custom Events

```javascript
// Client-side
appInsights.trackEvent({
  name: "CustomEvent",
  properties: { category: "business" },
  measurements: { value: 100 },
});

// Server-side
appInsightsClient.trackEvent({
  name: "ServerEvent",
  properties: { action: "process_data" },
});
```

## 🐛 Troubleshooting

### Common Issues

| Issue                   | Solution                                     |
| ----------------------- | -------------------------------------------- |
| 400 Bad Request errors  | Verify connection string format in `.env`    |
| OpenTelemetry warnings  | Use `server-simple.js` (default)             |
| No data in Azure Portal | Allow 5-10 minutes for data ingestion        |
| JavaScript errors       | Check browser console and verify SDK loading |

For detailed troubleshooting, see [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Azure Application Insights Team** for the comprehensive analytics platform
- **Microsoft Learn** for excellent documentation and best practices
- **OpenTelemetry Community** for modern observability standards

## 📞 Support

If you encounter any issues:

1. Check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
2. Review the [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md)
3. Open an issue on GitHub with detailed error information

---

**🚀 Ready to demonstrate comprehensive web analytics with Azure Application Insights!**
