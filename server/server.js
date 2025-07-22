/**
 * Application Insights PoC - Server-side Implementation
 * 
 * This Node.js Express server demonstrates comprehensive server-side telemetry
 * and analytics tracking using Azure Application Insights SDK.
 * 
 * Key Features:
 * - Automatic request/response tracking with custom metrics
 * - Server-side event and metric tracking APIs
 * - Purchase journey funnel analysis endpoints  
 * - Cohort analysis and A/B testing capabilities
 * - Performance monitoring and health checks
 * - Comprehensive error handling and logging
 * 
 * Architecture:
 * - Express.js web framework for RESTful APIs
 * - Application Insights SDK for telemetry collection
 * - Environment-based configuration for different deployments
 * - Graceful shutdown handling for production deployments
 * 
 * Compatible with: Application Insights Node.js SDK v3.0+
 */

// Load environment variables from .env file first
// This must be done before importing Application Insights
require("dotenv").config();

// ===================================================================
// ENVIRONMENT CONFIGURATION VALIDATION
// Verify that required environment variables are properly configured
// for Application Insights integration
// ===================================================================

console.log("Environment Variables Check:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- PORT:", process.env.PORT);
// Only show partial connection strings for security (avoid logging full keys)
console.log(
  "- APPLICATIONINSIGHTS_CONNECTION_STRING:",
  process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ? `${process.env.APPLICATIONINSIGHTS_CONNECTION_STRING.substring(0, 20)}...` : "NOT SET"
);
console.log(
  "- APPINSIGHTS_INSTRUMENTATIONKEY:",
  process.env.APPINSIGHTS_INSTRUMENTATIONKEY ? `${process.env.APPINSIGHTS_INSTRUMENTATIONKEY.substring(0, 8)}...` : "NOT SET"
);

// ===================================================================
// APPLICATION INSIGHTS INITIALIZATION
// Configure Azure Application Insights for server-side telemetry.
// Supports both connection string (preferred) and instrumentation key methods.
// ===================================================================

let client = null;
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
  try {
    const appInsights = require("applicationinsights");

    // Use connection string if available (recommended), otherwise fall back to instrumentation key
    const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || `InstrumentationKey=${process.env.APPINSIGHTS_INSTRUMENTATIONKEY}`;

    // Configure Application Insights with comprehensive auto-collection
    appInsights
      .setup(connectionString)
      .setAutoCollectRequests(true)       // Track HTTP requests automatically
      .setAutoCollectPerformance(true)    // Collect performance counters
      .setAutoCollectExceptions(true)     // Track unhandled exceptions
      .setAutoCollectDependencies(true)   // Track external dependencies (DB, HTTP calls)
      .setAutoCollectConsole(true)        // Track console.log statements
      .setUseDiskRetryCaching(true)       // Cache telemetry when network is unavailable
      .start();

    client = appInsights.defaultClient;
    console.log("✅ Application Insights initialized successfully");
  } catch (error) {
    console.log("⚠️  Application Insights initialization failed:", error.message);
  }
} else {
  console.log(
    "⚠️  Application Insights not configured - set APPLICATIONINSIGHTS_CONNECTION_STRING or APPINSIGHTS_INSTRUMENTATIONKEY environment variable"
  );
}

// ===================================================================
// EXPRESS SERVER SETUP
// Configure Express.js web server with middleware for handling
// HTTP requests, static files, and JSON parsing
// ===================================================================

// Import required modules after Application Insights initialization
const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Configure middleware for parsing request data
app.use(express.json());                              // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));     // Parse URL-encoded forms
app.use(express.static(path.join(__dirname, "..")));  // Serve static files from parent directory

// ===================================================================
// CUSTOM REQUEST TRACKING MIDDLEWARE
// Enhances Application Insights auto-collection with additional
// custom metrics and properties for detailed request analysis
// ===================================================================

app.use((req, res, next) => {
  const startTime = Date.now();

  // Track request completion and calculate response time
  res.on("finish", () => {
    const duration = Date.now() - startTime;

    // Track custom request metrics with enhanced context
    if (client) {
      client.trackRequest({
        name: `${req.method} ${req.route?.path || req.path}`,
        url: req.url,
        duration: duration,
        resultCode: res.statusCode,
        success: res.statusCode < 400, // Define success as non-error status codes
        properties: {
          userAgent: req.get("User-Agent"),
          referer: req.get("Referer"),
          method: req.method,
          path: req.path,
        },
      });

      // Track performance metrics for monitoring server response times
      client.trackMetric({
        name: "ServerResponseTime",
        value: duration,
        properties: {
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode.toString(),
        },
      });
    }
  });

  next();
});

// ===================================================================
// WEB ROUTES
// Handle web page requests and serve static content
// ===================================================================

/**
 * Home page route
 * 
 * Serves the main dashboard HTML file and tracks home page access events.
 * This provides insights into overall site traffic and user engagement patterns.
 */
app.get("/", (req, res) => {
  try {
    // Track home page access for traffic analysis
    if (client) {
      client.trackEvent({
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
    if (client) {
      client.trackException({ exception: error });
    }
    res.status(500).send("Internal Server Error");
  }
});

// ===================================================================
// ANALYTICS API ROUTES
// RESTful endpoints for client-side to server-side telemetry integration.
// These APIs allow the frontend JavaScript to send analytics data
// to the server for centralized tracking and processing.
// ===================================================================

/**
 * Generic event tracking endpoint
 * 
 * Accepts custom events from the client-side and forwards them to
 * Application Insights with additional server-side context.
 * 
 * POST /api/track-event
 * Body: { eventName, properties, measurements }
 */
app.post("/api/track-event", (req, res) => {
  try {
    const { eventName, properties, measurements } = req.body;

    if (client) {
      client.trackEvent({
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
    if (client) {
      client.trackException({ exception: error });
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

    if (client) {
      client.trackMetric({
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
    if (client) {
      client.trackException({ exception: error });
    }
    res.status(500).json({
      success: false,
      message: "Failed to track metric",
      error: error.message,
    });
  }
});

// Simulate purchase journey tracking
app.post("/api/purchase-journey/:step", (req, res) => {
  try {
    const { step } = req.params;
    const journeyData = req.body;

    const eventName = `PurchaseJourney_${step}`;
    const startTime = Date.now();

    // Simulate some processing time
    setTimeout(() => {
      const processingTime = Date.now() - startTime;

      if (client) {
        client.trackEvent({
          name: eventName,
          properties: {
            ...journeyData,
            step,
            serverTimestamp: new Date().toISOString(),
            userAgent: req.get("User-Agent"),
          },
          measurements: {
            serverProcessingTime: processingTime,
          },
        });

        // Track funnel metrics
        client.trackMetric({
          name: "FunnelConversion",
          value: 1,
          properties: {
            funnelStep: step,
            timestamp: new Date().toISOString(),
          },
        });
      }

      console.log(`🛒 Purchase Journey Step: ${step}`, journeyData);

      res.json({
        success: true,
        message: `${step} step completed successfully`,
        step,
        processingTime,
        timestamp: new Date().toISOString(),
      });
    }, Math.random() * 100 + 50); // 50-150ms processing time
  } catch (error) {
    console.error("Error in purchase journey:", error);
    if (client) {
      client.trackException({
        exception: error,
        properties: {
          purchaseStep: req.params.step,
        },
      });
    }
    res.status(500).json({
      success: false,
      message: "Purchase journey step failed",
      error: error.message,
    });
  }
});

// Cohort analysis endpoint
app.post("/api/cohort-analysis", (req, res) => {
  try {
    const { action, cohortId, userId } = req.body;

    // Simulate cohort analysis processing
    const cohortData = {
      cohortId: cohortId || `cohort_${new Date().getFullYear()}_${String(new Date().getMonth() + 1).padStart(2, "0")}`,
      action,
      userId,
      timestamp: new Date().toISOString(),
      metrics: {
        totalUsers: Math.floor(Math.random() * 1000) + 100,
        activeUsers: Math.floor(Math.random() * 500) + 50,
        retentionRate: Math.random() * 0.4 + 0.3,
        avgSessionDuration: Math.floor(Math.random() * 300) + 120,
      },
    };

    if (client) {
      client.trackEvent({
        name: "CohortAnalysis",
        properties: {
          action,
          cohortId: cohortData.cohortId,
          userId,
          serverTimestamp: new Date().toISOString(),
        },
        measurements: cohortData.metrics,
      });
    }

    console.log(`👥 Cohort Analysis: ${action}`, cohortData);

    res.json({
      success: true,
      message: "Cohort analysis completed",
      data: cohortData,
    });
  } catch (error) {
    console.error("Error in cohort analysis:", error);
    if (client) {
      client.trackException({ exception: error });
    }
    res.status(500).json({
      success: false,
      message: "Cohort analysis failed",
      error: error.message,
    });
  }
});

// A/B Testing endpoint
app.post("/api/ab-test", (req, res) => {
  try {
    const { testName, variant, userId } = req.body;

    // Simulate A/B test assignment and results
    const testData = {
      testName,
      variant,
      userId,
      timestamp: new Date().toISOString(),
      assigned: true,
      // Simulate different conversion rates per variant
      conversionRate: variant === "variant_a" ? 0.15 : 0.22,
      sampleSize: Math.floor(Math.random() * 1000) + 100,
    };

    // Determine if this user converts in the test
    const converts = Math.random() < testData.conversionRate;

    if (client) {
      client.trackEvent({
        name: "ABTestAssignment",
        properties: {
          testName,
          variant,
          userId,
          serverTimestamp: new Date().toISOString(),
        },
      });

      if (converts) {
        client.trackEvent({
          name: "ABTestConversion",
          properties: {
            testName,
            variant,
            userId,
            serverTimestamp: new Date().toISOString(),
          },
        });
      }

      client.trackMetric({
        name: "ABTestParticipation",
        value: 1,
        properties: {
          testName,
          variant,
        },
      });
    }

    console.log(`🧪 A/B Test: ${testName} - ${variant}`, { converts, ...testData });

    res.json({
      success: true,
      message: "A/B test assignment completed",
      data: {
        ...testData,
        converted: converts,
      },
    });
  } catch (error) {
    console.error("Error in A/B test:", error);
    if (client) {
      client.trackException({ exception: error });
    }
    res.status(500).json({
      success: false,
      message: "A/B test assignment failed",
      error: error.message,
    });
  }
});

// Performance monitoring endpoint
app.get("/api/performance", (req, res) => {
  try {
    const performanceData = {
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };

    if (client) {
      client.trackMetric({
        name: "ServerUptime",
        value: performanceData.serverUptime,
      });

      client.trackMetric({
        name: "MemoryUsage",
        value: performanceData.memoryUsage.heapUsed,
        properties: {
          type: "heapUsed",
        },
      });
    }

    console.log("📊 Performance Data Requested", performanceData);

    res.json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    console.error("Error getting performance data:", error);
    if (client) {
      client.trackException({ exception: error });
    }
    res.status(500).json({
      success: false,
      message: "Failed to get performance data",
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
      appInsightsEnabled: !!(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || process.env.APPINSIGHTS_INSTRUMENTATIONKEY),
    };

    if (client) {
      client.trackEvent({
        name: "HealthCheck",
        properties: healthData,
      });
    }

    console.log("❤️  Health Check Requested", healthData);

    res.json(healthData);
  } catch (error) {
    console.error("Health check failed:", error);
    if (client) {
      client.trackException({ exception: error });
    }
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  if (client) {
    client.trackException({
      exception: error,
      properties: {
        url: req.url,
        method: req.method,
        userAgent: req.get("User-Agent"),
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
  if (client) {
    client.trackEvent({
      name: "404NotFound",
      properties: {
        url: req.url,
        method: req.method,
        userAgent: req.get("User-Agent"),
        referer: req.get("Referer"),
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

  if (client) {
    client.trackEvent({
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

  if (client) {
    client.trackEvent({
      name: "ServerShutdown",
      properties: {
        reason: "SIGTERM",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });

    // Flush any remaining telemetry
    client.flush();
  }

  process.exit(0);
});

module.exports = app;
