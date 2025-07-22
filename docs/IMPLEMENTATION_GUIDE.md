# Application Insights PoC - Implementation Documentation

## Overview

This Proof of Concept (PoC) demonstrates comprehensive web analytics and telemetry tracking using **Azure Application Insights**. The implementation covers all the specified requirements from web metrics to cohort analysis, providing both client-side and server-side tracking capabilities.

## 🏗️ Architecture

### Frontend

- **HTML5** with responsive design and interactive UI
- **Vanilla JavaScript** with Application Insights SDK integration
- **Real-time metrics** display and user interaction tracking

### Backend

- **Node.js/Express** server with Application Insights server-side SDK
- **REST API endpoints** for advanced analytics
- **Custom telemetry** and performance monitoring

### Azure Integration

- **Application Insights JavaScript SDK** for client-side telemetry
- **Application Insights Node.js SDK** for server-side telemetry
- **Custom events, metrics, and dependency tracking**

---

## 📊 Requirements Implementation

### 1. Web Metrics

| **Metric** | **Implementation** | **Technical Details** |
| --- | --- | --- |
| **Sessions / Visitors** | ✅ Implemented | - Unique session ID generation<br>- User ID persistence in localStorage<br>- Session tracking via `trackPageView()` |
| **New vs. Returning Visitors** | ✅ Implemented | - `simulateNewVisitor()` and `simulateReturningVisitor()`<br>- Visitor type stored in localStorage<br>- Days since last visit calculation |
| **Bounce Rate** | ✅ Implemented | - `simulateBounce()` function<br>- Time on page measurement<br>- Exit reason tracking |
| **Avg. Time on Page/Site** | ✅ Implemented | - Real-time timer updates every 5 seconds<br>- `trackTimeOnPage()` custom metric<br>- Session duration tracking |
| **Pages per Session** | ✅ Implemented | - Page view counter in session<br>- `pageViewCount` tracking<br>- Session-based aggregation |
| **Exit Rate by Page** | ✅ Implemented | - Exit event tracking in `simulateBounce()`<br>- Page-specific exit tracking<br>- Custom Application Insights events |

**Code Example:**

```javascript
trackPageView(pageName = 'Home') {
    this.pageViewCount++;
    appInsights.trackPageView({
        name: pageName,
        uri: window.location.href,
        properties: {
            sessionId: this.sessionId,
            pageNumber: this.pageViewCount
        },
        measurements: {
            timeOnPage: Date.now() - this.sessionStartTime
        }
    });
}
```

### 2. Purchase Journey Metrics

| **Metric** | **Implementation** | **Technical Details** |
| --- | --- | --- |
| **Quote Request Volume** | ✅ Implemented | - `submitQuoteRequest()` function<br>- Form validation and data capture<br>- Custom event tracking with insurance type and coverage amount |
| **Quote-to-Application Rate** | ✅ Implemented | - Funnel tracking with `FunnelStep` events<br>- Quote ID linking to applications<br>- Conversion rate calculation |
| **Application Completion Rate** | ✅ Implemented | - `startApplication()` and `completeApplication()`<br>- Time-to-complete measurement<br>- Form abandonment tracking |
| **Policies Sold** | ✅ Implemented | - `purchasePolicy()` function<br>- Policy ID generation<br>- Revenue tracking with coverage amounts |
| **Overall Conversion Rate** | ✅ Implemented | - End-to-end funnel tracking<br>- `Conversion` event with conversion value<br>- Multiple conversion types support |
| **Time to Convert** | ✅ Implemented | - Session start time to conversion measurement<br>- `timeToConvertMs` custom measurement<br>- Journey timing analytics |
| **Funnel Drop-off % by Stage** | ✅ Implemented | - `FunnelStep` events for each stage<br>- Drop-off calculation between stages<br>- Stage-specific analytics |

**Code Example:**

```javascript
purchasePolicy() {
    const policyId = 'policy_' + Date.now();
    appInsights.trackEvent({
        name: 'PolicyPurchased',
        properties: {
            policyId,
            applicationId: this.currentApplicationId,
            quoteId: this.currentQuoteId
        },
        measurements: {
            timeToConvertMs: Date.now() - this.sessionStartTime
        }
    });
}
```

### 3. Segment & Cohort Analysis

| **Metric** | **Implementation** | **Technical Details** |
| --- | --- | --- |
| **Cohort Retention Curves** | ✅ Implemented | - `joinCohort()` and `trackRetention()`<br>- Monthly cohort generation<br>- Days since join calculation<br>- Server-side cohort API endpoint |

**Code Example:**

```javascript
trackRetention() {
    const daysSinceJoin = Math.floor((Date.now() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24));
    appInsights.trackEvent({
        name: 'CohortRetention',
        properties: { cohortId, retentionEvent: 'active_engagement' },
        measurements: { daysSinceJoin }
    });
}
```

### 4. Experimentation & Personalization

| **Metric** | **Implementation** | **Technical Details** |
| --- | --- | --- |
| **A/B Test Lift** | ✅ Implemented | - `runABTest()` with variant tracking<br>- Simulated conversion rates (15% vs 22%)<br>- Test participation and conversion events<br>- Server-side A/B test API |
| **Page Load Time** | ✅ Implemented | - `measurePageLoad()` function<br>- `trackPageViewPerformance()` with detailed timing<br>- Network, request, response, and DOM processing times |

**Code Example:**

```javascript
runABTest(variant) {
    appInsights.trackEvent({
        name: 'ABTestParticipation',
        properties: { testName: 'homepage_cta_test', variant }
    });

    const conversionRate = variant === 'variant_a' ? 0.15 : 0.22;
    const converted = Math.random() < conversionRate;

    if (converted) {
        appInsights.trackEvent({
            name: 'ABTestConversion',
            properties: { testName: 'homepage_cta_test', variant }
        });
    }
}
```

### 5. Segmentation

| **Metric** | **Implementation** | **Technical Details** |
| --- | --- | --- |
| **Device & Browser Breakdown** | ✅ Implemented | - `trackDeviceInfo()` comprehensive device tracking<br>- User agent, platform, screen resolution<br>- Viewport, color depth, timezone<br>- Custom segmentation support |
| **Error Rate** | ✅ Implemented | - `simulateError()` for error tracking<br>- Exception tracking with Application Insights<br>- Client and server error monitoring<br>- Error rate calculation |

**Code Example:**

```javascript
trackDeviceInfo() {
    const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    appInsights.trackEvent({
        name: 'DeviceInfo',
        properties: deviceInfo
    });
}
```

---

## 🔧 Technical Implementation Details

### Application Insights Integration

#### Client-Side SDK Configuration

```javascript
var aisdk =
  window[aiName] ||
  (function (e) {
    // Application Insights SDK initialization
    // Automatic page view tracking
    // Exception tracking
    // Custom telemetry initialization
  })({
    instrumentationKey: "YOUR_INSTRUMENTATION_KEY_HERE",
  });
```

#### Server-Side SDK Configuration

```javascript
appInsights
  .setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true)
  .setUseDiskRetryCaching(true)
  .setSendLiveMetrics(true)
  .start();
```

### Custom Telemetry Implementation

#### Event Tracking

- **Custom Events**: Business-specific events like quote requests, applications, purchases
- **Properties**: Contextual data (user ID, session ID, insurance type)
- **Measurements**: Numerical data (coverage amounts, processing times)

#### Metrics Tracking

- **Performance Metrics**: Page load times, server response times
- **Business Metrics**: Conversion rates, funnel progression
- **User Engagement**: Time on page, session duration

#### Exception Tracking

- **Client Errors**: JavaScript exceptions and errors
- **Server Errors**: API failures and processing errors
- **Custom Exceptions**: Business logic errors

### Session and User Management

#### Session Tracking

```javascript
generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```

#### User Persistence

```javascript
getOrCreateUserId() {
    let userId = localStorage.getItem('app_insights_user_id');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('app_insights_user_id', userId);
    }
    return userId;
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 14+ installed
- Azure Application Insights resource created
- Instrumentation key obtained from Azure portal

### Installation Steps

1. **Install Dependencies**

   ```bash
   cd c:\DEV\appinsight_clarity
   npm install
   ```

2. **Configure Application Insights**

   - Replace `YOUR_INSTRUMENTATION_KEY_HERE` in `index.html`
   - Set environment variable:
     ```bash
     $env:APPINSIGHTS_INSTRUMENTATIONKEY="your-instrumentation-key-here"
     ```

3. **Start the Server**

   ```bash
   npm start
   ```

4. **Access the Application**
   - Open browser to `http://localhost:3000`
   - Begin interacting with the analytics demo

### Environment Variables

- `APPINSIGHTS_INSTRUMENTATIONKEY`: Your Application Insights instrumentation key
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

---

## 📊 Monitoring and Analytics

### Application Insights Dashboard

Once the application is running and instrumentation key is configured, you can monitor:

1. **Live Metrics Stream**: Real-time telemetry data
2. **Application Map**: Dependencies and performance
3. **Performance**: Response times and throughput
4. **Failures**: Exception rates and failed requests
5. **Users**: Session and user analytics
6. **Events**: Custom business events
7. **Metrics**: Custom metrics and KPIs

### Custom Queries (KQL)

Access Application Insights Analytics to run custom queries:

```kusto
// Quote to Purchase Conversion Rate
let quoteRequests = customEvents | where name == "QuoteRequested" | count;
let policyPurchases = customEvents | where name == "PolicyPurchased" | count;
print ConversionRate = todouble(policyPurchases) / todouble(quoteRequests) * 100

// Average Time to Convert
customEvents
| where name == "PolicyPurchased"
| extend TimeToConvert = todouble(customMeasurements["timeToConvertMs"]) / 1000 / 60
| summarize AvgTimeToConvertMinutes = avg(TimeToConvert)

// A/B Test Results
customEvents
| where name in ("ABTestParticipation", "ABTestConversion")
| extend variant = tostring(customDimensions["variant"])
| summarize
    Participants = countif(name == "ABTestParticipation"),
    Conversions = countif(name == "ABTestConversion")
    by variant
| extend ConversionRate = todouble(Conversions) / todouble(Participants) * 100
```

---

## 🔍 API Endpoints

### Analytics API

- `POST /api/track-event`: Track custom events
- `POST /api/track-metric`: Track custom metrics
- `POST /api/purchase-journey/:step`: Track purchase funnel steps
- `POST /api/cohort-analysis`: Cohort analysis operations
- `POST /api/ab-test`: A/B test assignment and tracking

### Monitoring API

- `GET /api/health`: Application health check
- `GET /api/performance`: Server performance metrics

### Example API Usage

```javascript
// Track custom event via API
fetch("/api/track-event", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    eventName: "CustomBusinessEvent",
    properties: { category: "user_action" },
    measurements: { value: 100 },
  }),
});
```

---

## 🎯 Key Features Demonstrated

### ✅ Comprehensive Analytics Coverage

- All required web metrics implemented
- Complete purchase journey tracking
- Advanced segmentation and cohort analysis
- A/B testing and experimentation

### ✅ Real-time Monitoring

- Live metrics streaming
- Immediate telemetry feedback
- Performance monitoring
- Error tracking and alerting

### ✅ Scalable Architecture

- Client and server-side tracking
- RESTful API design
- Modular implementation
- Production-ready code structure

### ✅ Business Intelligence

- Funnel analysis capabilities
- Conversion optimization insights
- User behavior analytics
- Performance impact measurement

---

## 🔧 Customization and Extension

### Adding New Metrics

1. Create new tracking function in `analytics.js`
2. Add UI elements in `index.html`
3. Implement server-side API endpoint if needed
4. Update documentation

### Custom Dimensions and Measurements

```javascript
appInsights.trackEvent({
  name: "CustomEvent",
  properties: {
    // Custom dimensions (string values)
    category: "business",
    source: "web",
  },
  measurements: {
    // Custom measurements (numeric values)
    value: 123.45,
    duration: 1000,
  },
});
```

### Advanced Telemetry

```javascript
// Custom telemetry initializer
appInsights.addTelemetryInitializer((envelope) => {
  envelope.tags["ai.cloud.role"] = "web-frontend";
  envelope.tags["ai.operation.name"] = "user-journey";
  return true;
});
```

---

## 📈 Expected Outcomes

### Analytics Insights

- **User Behavior**: Understanding how users navigate the insurance quote process
- **Conversion Optimization**: Identifying bottlenecks in the purchase funnel
- **Performance Impact**: Correlating page load times with conversion rates
- **Segmentation Value**: Tailoring experiences based on device, browser, and user type

### Business Value

- **Data-Driven Decisions**: Concrete metrics for business optimization
- **Real-time Monitoring**: Immediate visibility into application performance
- **Customer Journey Understanding**: Complete view of user interactions
- **ROI Measurement**: Quantifiable impact of UX and marketing changes

This PoC demonstrates a production-ready approach to implementing comprehensive web analytics using Azure Application Insights, providing the foundation for data-driven business intelligence and optimization.
