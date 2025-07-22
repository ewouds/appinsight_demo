/**
 * Application Insights PoC - Simplified Server Implementation
 *
 * This simplified server implementation provides a production-ready solution with:
 * 
 * KEY FEATURES:
 * - Azure Application Insights integration with minimal OpenTelemetry conflicts
 * - Manual request tracking for precise control over telemetry data
 * - RESTful API endpoints for client-server analytics coordination
 * - Comprehensive error handling and graceful failure modes
 * - Environment-based configuration for different deployment scenarios
 * 
 * ARCHITECTURE DECISIONS:
 * - Disables auto-collection features that may conflict with other monitoring tools
 * - Uses manual telemetry tracking for better control and customization
 * - Implements custom middleware for request/response tracking
 * - Provides configuration endpoint for client-side Application Insights setup
 * 
 * RECOMMENDED FOR:
 * - Production deployments where OpenTelemetry compatibility is required
 * - Development environments with complex monitoring tool stacks
 * - Scenarios requiring custom telemetry processing logic
 * - Applications with specific performance and monitoring requirements
 * 
 * BROWSER COMPATIBILITY: All modern browsers (ES6+)
 * NODE.JS COMPATIBILITY: Node.js 14+ with Application Insights SDK v3.0+
 */

// ===================================================================
// ENVIRONMENT CONFIGURATION AND SECURITY
// Load and validate environment variables while protecting sensitive data
// from accidental exposure in logs or development environments
// ===================================================================

// Load environment variables from .env file first (must be before other imports)
require("dotenv").config();

console.log("🔧 Environment Variables Check:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- PORT:", process.env.PORT);
// Security: Only show partial connection strings to prevent key exposure in logs
console.log(
  "- APPLICATIONINSIGHTS_CONNECTION_STRING:",
  process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ? `${process.env.APPLICATIONINSIGHTS_CONNECTION_STRING.substring(0, 20)}...` : "NOT SET"
);
console.log(
  "- APPINSIGHTS_INSTRUMENTATIONKEY:",
  process.env.APPINSIGHTS_INSTRUMENTATIONKEY ? `${process.env.APPINSIGHTS_INSTRUMENTATIONKEY.substring(0, 8)}...` : "NOT SET"
);

// ===================================================================
// APPLICATION INSIGHTS INITIALIZATION (SIMPLIFIED MODE)
// Initialize Azure Application Insights with minimal auto-collection
// to avoid conflicts with OpenTelemetry or other monitoring solutions
// ===================================================================

// Import required modules
const express = require("express");
const path = require("path");

// Initialize Application Insights client without auto-collection to avoid OpenTelemetry conflicts
let appInsightsClient = null;
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  try {
    const appInsights = require("applicationinsights");

    // Use connection string if available (preferred method), otherwise fall back to instrumentation key
    const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || `InstrumentationKey=${process.env.APPINSIGHTS_INSTRUMENTATIONKEY}`;

    // Initialize with minimal auto-collection to avoid conflicts with other monitoring tools
    appInsights
      .setup(connectionString)
      .setAutoCollectRequests(false)    // Disable to prevent conflicts - we'll track manually
      .setAutoCollectPerformance(false) // Disable to reduce overhead and conflicts
      .setAutoCollectExceptions(true)   // Keep exception tracking - it's low-conflict and valuable
      .setAutoCollectDependencies(false)// Disable to prevent dependency tracking conflicts
      .setAutoCollectConsole(false)     // Disable console tracking to reduce noise
      .setUseDiskRetryCaching(true)     // Enable caching for network resilience
      .start();

    appInsightsClient = appInsights.defaultClient;
    console.log("✅ Application Insights initialized successfully (simplified mode)");
  } catch (error) {
    console.log("⚠️  Application Insights initialization failed:", error.message);
  }
} else {
  console.log(
    "⚠️  Application Insights not configured - set APPLICATIONINSIGHTS_CONNECTION_STRING or APPINSIGHTS_INSTRUMENTATIONKEY environment variable"
  );
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..")));

// Manual request tracking middleware (since auto-collection is disabled)
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    // Manual request tracking
    if (appInsightsClient) {
      try {
        appInsightsClient.trackRequest({
          name: `${req.method} ${req.path}`,
          url: req.url,
          duration: duration,
          resultCode: res.statusCode,
          success: res.statusCode < 400,
          properties: {
            userAgent: req.get("User-Agent"),
            method: req.method,
            path: req.path,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.log("Request tracking error:", error.message);
      }
    }
  });

  next();
});

// Routes

// Configuration endpoint for client-side Application Insights
app.get("/api/config", (req, res) => {
  try {
    const config = {
      connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "",
      instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY || "",
      environment: process.env.NODE_ENV || "development",
    };

    // Don't expose the full connection string in logs
    console.log(`📋 Config requested - Has connection string: ${!!config.connectionString}`);

    res.json(config);
  } catch (error) {
    console.error("❌ Error serving config:", error);
    res.status(500).json({ error: "Configuration error" });
  }
});

// Home page
app.get("/", (req, res) => {
  try {
    if (appInsightsClient) {
      appInsightsClient.trackEvent({
        name: "HomePageAccess",
        properties: {
          timestamp: new Date().toISOString(),
          userAgent: req.get("User-Agent"),
          ip: req.ip,
        },
      });
    }

    res.sendFile(path.join(__dirname, "..", "index.html"));
  } catch (error) {
    console.error("Error serving home page:", error);
    if (appInsightsClient) {
      appInsightsClient.trackException({ exception: error });
    }
    res.status(500).send("Internal Server Error");
  }
});

// API Routes for Analytics

// Track server-side events
app.post("/api/track-event", (req, res) => {
  try {
    const { eventName, properties, measurements } = req.body;

    if (appInsightsClient) {
      appInsightsClient.trackEvent({
        name: eventName,
        properties: {
          ...properties,
          serverTimestamp: new Date().toISOString(),
          userAgent: req.get("User-Agent"),
          ip: req.ip,
        },
        measurements,
      });
    }

    console.log(`📊 Server Event Tracked: ${eventName}`, properties);

    res.json({
      success: true,
      message: "Event tracked successfully",
      eventName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error tracking event:", error);
    if (appInsightsClient) {
      appInsightsClient.trackException({ exception: error });
    }
    res.status(500).json({
      success: false,
      message: "Failed to track event",
      error: error.message,
    });
  }
});

// Track custom metrics
app.post("/api/track-metric", (req, res) => {
  try {
    const { metricName, value, properties } = req.body;

    if (appInsightsClient) {
      appInsightsClient.trackMetric({
        name: metricName,
        value: parseFloat(value),
        properties: {
          ...properties,
          serverTimestamp: new Date().toISOString(),
        },
      });
    }

    console.log(`📈 Server Metric Tracked: ${metricName} = ${value}`, properties);

    res.json({
      success: true,
      message: "Metric tracked successfully",
      metricName,
      value,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error tracking metric:", error);
    if (appInsightsClient) {
      appInsightsClient.trackException({ exception: error });
    }
    res.status(500).json({
      success: false,
      message: "Failed to track metric",
      error: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  try {
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      appInsightsEnabled: !!appInsightsClient,
    };

    if (appInsightsClient) {
      appInsightsClient.trackEvent({
        name: "HealthCheck",
        properties: healthData,
      });
    }

    console.log("❤️  Health Check Requested", healthData);

    res.json(healthData);
  } catch (error) {
    console.error("Health check failed:", error);
    if (appInsightsClient) {
      appInsightsClient.trackException({ exception: error });
    }
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Simple purchase journey endpoint
app.post("/api/purchase-journey/:step", (req, res) => {
  try {
    const { step } = req.params;
    const journeyData = req.body;

    if (appInsightsClient) {
      appInsightsClient.trackEvent({
        name: `PurchaseJourney_${step}`,
        properties: {
          ...journeyData,
          step,
          serverTimestamp: new Date().toISOString(),
        },
      });
    }

    console.log(`🛒 Purchase Journey Step: ${step}`, journeyData);

    res.json({
      success: true,
      message: `${step} step completed successfully`,
      step,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in purchase journey:", error);
    if (appInsightsClient) {
      appInsightsClient.trackException({ exception: error });
    }
    res.status(500).json({
      success: false,
      message: "Purchase journey step failed",
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  if (appInsightsClient) {
    appInsightsClient.trackException({
      exception: error,
      properties: {
        url: req.url,
        method: req.method,
      },
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
  });
});

// 404 handler
app.use((req, res) => {
  if (appInsightsClient) {
    appInsightsClient.trackEvent({
      name: "404NotFound",
      properties: {
        url: req.url,
        method: req.method,
      },
    });
  }

  res.status(404).json({
    success: false,
    message: "Resource not found",
    url: req.url,
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Application Insights PoC Server running at http://localhost:${port}`);
  console.log(`📊 Dashboard available at: http://localhost:${port}`);
  console.log(`🔍 API Health Check: http://localhost:${port}/api/health`);

  if (appInsightsClient) {
    appInsightsClient.trackEvent({
      name: "ServerStartup",
      properties: {
        port: port.toString(),
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🔄 SIGTERM received, shutting down gracefully");

  if (appInsightsClient) {
    appInsightsClient.trackEvent({
      name: "ServerShutdown",
      properties: {
        reason: "SIGTERM",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });

    // Flush any remaining telemetry
    appInsightsClient.flush();
  }

  process.exit(0);
});

module.exports = app;
