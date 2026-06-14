import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// AppRouteGuard monitors security boundaries on the Flutter client.
/// It inspects the current user session's 'authorizedApplicationId' before every navigation event.
/// If the requested path falls outside the authorized module's scope,
/// it intercepts the transit, flags a 403 Forbidden, and redirects to the default home dashboard.
class AppRouteGuard {
  // Mapping application group IDs to lists of authorized clinical route prefixes.
  static const Map<String, List<String>> moduleScopes = {
    'reception_intake': [
      '/reception/intake',
      '/reception/queue',
    ],
    'nurse_triage': [
      '/reception/queue',
      '/nurse/triage',
    ],
    'doctor_comprehensive': [
      '/reception/queue',
      '/clinic/comprehensive',
      '/clinic/odontogram',
    ],
    'accounting_ledger': [
      '/reception/queue',
      '/accounting/invoices',
      '/accounting/ledger',
      '/accounting/reports/profit-loss',
    ],
  };

  // Safe default clinical home dashboards to redirect intercepted users.
  static const Map<String, String> defaultHomes = {
    'reception_intake': '/reception/intake',
    'nurse_triage': '/nurse/triage',
    'doctor_comprehensive': '/clinic/comprehensive',
    'accounting_ledger': '/accounting/ledger',
  };

  /// The GoRouter redirect callback acting as our client-side micro-fencing gateway.
  static String? redirect(BuildContext context, GoRouterState state) {
    // 1. Resolve active credentials from session context
    final session = UserSession.current;
    final appId = session?.authorizedApplicationId;
    final requestedPath = state.uri.path;

    debugPrint('[ROUTE_GUARD] Intercepting navigation to path: $requestedPath');

    // Allow vital shared access endpoints
    if (requestedPath == '/' || requestedPath == '/login') {
      return null; 
    }

    if (appId == null) {
      debugPrint('[ROUTE_GUARD] 401 Unauthorized - Active session not discovered. Redirecting to login.');
      return '/login';
    }

    // 2. Validate application scope access boundaries
    final allowedPaths = moduleScopes[appId] ?? [];
    
    // Validate if the requested route starts with any of the authorized path nodes
    final isAuthorized = allowedPaths.any((path) => requestedPath.startsWith(path));

    if (!isAuthorized) {
      final defaultHome = defaultHomes[appId] ?? '/';
      
      debugPrint(
        '[ROUTE_GUARD] 🛡️ 403 FORBIDDEN - Session Application ID "$appId" is strictly prohibited from entering "$requestedPath".'
      );
      debugPrint('[ROUTE_GUARD] Triggering auto-fallback redirect to module safe home: $defaultHome');

      // Dispatch an isolated post-frame notifier banner
      _notifyFencingViolation(context, requestedPath, appId, defaultHome);

      return defaultHome; 
    }

    debugPrint('[ROUTE_GUARD] Access Approved (200 OK) for path: $requestedPath');
    return null; // Null returns allow GoRouter to proceed with navigation normally
  }

  static void _notifyFencingViolation(BuildContext context, String path, String appId, String home) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.shield_outlined, color: Colors.amberAccent),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '403 Access Denied: Module "$appId" restricted from accessing "$path". Redirected to module home.',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFFD32F2F), // Clinical deep error red
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          duration: const Duration(seconds: 4),
        ),
      );
    });
  }
}

/// Represents the active user credential session container.
class UserSession {
  final String? authorizedApplicationId;

  UserSession({this.authorizedApplicationId});

  static UserSession? _instance;
  static UserSession? get current => _instance;

  static void setSession(String? appId) {
    _instance = UserSession(authorizedApplicationId: appId);
    debugPrint('[SESSION_MANAGER] Active terminal context set to application space: $appId');
  }

  static void clear() {
    _instance = null;
    debugPrint('[SESSION_MANAGER] Current session cleared.');
  }
}
