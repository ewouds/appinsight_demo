# Application Insights PoC - OpenTelemetry Issue Resolution

## 🎯 Issue Summary

The Application Insights PoC was experiencing OpenTelemetry compatibility issues with the newer Application Insights v3.0 SDK, causing warnings and initialization failures.

## ⚠️ Original Problems

1. **OpenTelemetry Loading Order**: `@azure/core-tracing` was being loaded before `@azure/opentelemetry-instrumentation-azure-sdk`
2. **TelemetryClient Initialization Error**: `api_1.trace.getTracerProvider(...).getDelegate(...).addSpanProcessor is not a function`
3. **Environment Variables**: Server wasn't reading from `.env` file properly
4. **Module Conflicts**: v3.0 SDK has different initialization requirements
5. **Deprecated API Methods**: `appInsights.setAuthenticatedUserContext is not a function` - API changed in v3.0

## ✅ Solutions Implemented

### 1. **Environment Variables Fixed**

- Added `dotenv` package to dependencies
- Added `require("dotenv").config()` at the top of server files
- Updated `.env` file with correct connection string format

### 2. **Created Simplified Server Implementation**

- **File**: `server/server-simple.js`
- **Approach**: Disabled auto-collection features that cause OpenTelemetry conflicts
- **Manual Tracking**: Implemented manual request and event tracking
- **Stable**: Works without OpenTelemetry warnings affecting functionality

### 3. **Fixed Application Insights v3.0 API Compatibility**

- **Issue**: `setAuthenticatedUserContext` method deprecated in v3.0
- **Solution**: Replaced with modern telemetry initializer approach
- **Code**: Updated `analytics.js` to use `addTelemetryInitializer` for user context
- **Benefits**: Full compatibility with latest Application Insights JavaScript SDK

### 4. **Dual Server Options**

- **`server-simple.js`**: Recommended for development/demo (fewer conflicts)
- **`server.js`**: Full-featured but with OpenTelemetry warnings

## 🚀 Current Status

✅ **Server Running**: `http://localhost:3000`  
✅ **Application Insights**: Properly initialized and tracking events  
✅ **Environment Variables**: Loading correctly from `.env` file  
✅ **Dashboard**: Interactive analytics demo working  
✅ **API Endpoints**: All endpoints functional

## 📊 What's Working

### Client-Side Tracking

- Page views and user interactions
- Purchase journey simulation
- A/B testing demonstrations
- Device and browser tracking
- Cohort analysis

### Server-Side Tracking

- Manual request tracking
- Custom events and metrics
- Exception tracking
- Health monitoring
- Purchase journey API

### Application Insights Integration

- Events: Custom business events
- Metrics: Performance and business metrics
- Exceptions: Error tracking
- Requests: HTTP request monitoring (manual)

## 🔧 Configuration

### Environment Variables (`.env`)

```bash
# Connection string (recommended)
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=your-key;IngestionEndpoint=...

# Alternative: Just instrumentation key
APPINSIGHTS_INSTRUMENTATIONKEY=your-instrumentation-key

# Server settings
PORT=3000
NODE_ENV=development
```

### Package.json Scripts

```json
{
  "start": "node server/server-simple.js", // Simplified server (recommended)
  "start-full": "node server/server.js", // Full server (with warnings)
  "dev": "nodemon server/server-simple.js" // Development mode
}
```

## 🎮 How to Use

1. **Start Server**:

   ```bash
   cd c:\DEV\appinsight_clarity
   npm start
   ```

2. **Open Dashboard**: `http://localhost:3000`

3. **Monitor Data**: Azure Portal → Application Insights → Live Metrics

4. **Test APIs**:
   - Health Check: `GET /api/health`
   - Track Event: `POST /api/track-event`
   - Track Metric: `POST /api/track-metric`

## 📈 Expected Data in Application Insights

### Events

- `HomePageAccess`: When dashboard is loaded
- `ServerStartup`: When server starts
- `HealthCheck`: When health endpoint is called
- `PurchaseJourney_*`: Purchase funnel steps
- `QuoteRequested`, `ApplicationStarted`, etc.: Business events

### Metrics

- `ServerResponseTime`: API response times
- Custom metrics from client interactions

### Requests

- HTTP requests to all endpoints
- Duration and success/failure tracking

## 🔍 Troubleshooting

### If JavaScript Errors Appear

**Error**: `appInsights.setAuthenticatedUserContext is not a function`
- **Cause**: Using Application Insights v3.0 with deprecated v2.x API methods
- **Solution**: Code updated to use modern `addTelemetryInitializer` approach
- **Status**: ✅ Fixed in current version

### If OpenTelemetry Warnings Appear

- **Impact**: Warnings only, functionality still works
- **Solution**: Use `server-simple.js` (already configured as default)
- **Alternative**: Downgrade to Application Insights v2.9.5

### If Environment Variables Not Loading

- **Check**: `.env` file exists in project root
- **Verify**: `dotenv` package is installed
- **Confirm**: No quotes around values in `.env` file

### If Port 3000 Already in Use

```bash
# Stop existing Node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Or use different port
$env:PORT=3001
npm start
```

## 🎯 Demonstration Ready

The PoC is now fully functional and demonstrates:

- ✅ All specified web metrics requirements
- ✅ Complete purchase journey tracking
- ✅ A/B testing capabilities
- ✅ Device and browser segmentation
- ✅ Cohort analysis features
- ✅ Real-time Application Insights integration

**🚀 Ready for demonstration and Azure Application Insights data collection!**
