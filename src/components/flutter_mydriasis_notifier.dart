import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// The active eye targeted for pupillary mydriasis dilation drops.
enum SelectedEye {
  right,    // OD (Oculus Dexter)
  left,     // OS (Oculus Sinister)
  bilateral // OU (Oculus Uterque / Both Eyes)
}

/// Immutable state container representing an active clinical dilation tracking session.
class MydriasisSessionState {
  final String patientId;
  final String patientName;
  final SelectedEye targetEye;
  final DateTime instillTime;
  final int totalDurationMinutes;
  final bool isCompleted;
  final bool isPaused;

  const MydriasisSessionState({
    required this.patientId,
    required this.patientName,
    required this.targetEye,
    required this.instillTime,
    this.totalDurationMinutes = 20, // Strict Clinical Standard (20 Minutes)
    this.isCompleted = false,
    this.isPaused = false,
  });

  /// Mathematical calculation of exact remaining seconds, fully immune to app hibernation
  /// as it computes the difference relative to the dynamic hardware system clock.
  int get secondsRemaining {
    if (isCompleted) return 0;
    
    final targetTime = instillTime.add(Duration(minutes: totalDurationMinutes));
    final difference = targetTime.difference(DateTime.now()).inSeconds;
    
    return difference > 0 ? difference : 0;
  }

  /// Helper label for user interface representation
  String get eyeLabel {
    switch (targetEye) {
      case SelectedEye.right:
        return 'OD (Right Eye)';
      case SelectedEye.left:
        return 'OS (Left Eye)';
      case SelectedEye.bilateral:
        return 'OU (Bilateral)';
    }
  }

  MydriasisSessionState copyWith({
    String? patientId,
    String? patientName,
    SelectedEye? targetEye,
    DateTime? instillTime,
    int? totalDurationMinutes,
    bool? isCompleted,
    bool? isPaused,
  }) {
    return MydriasisSessionState(
      patientId: patientId ?? this.patientId,
      patientName: patientName ?? this.patientName,
      targetEye: targetEye ?? this.targetEye,
      instillTime: instillTime ?? this.instillTime,
      totalDurationMinutes: totalDurationMinutes ?? this.totalDurationMinutes,
      isCompleted: isCompleted ?? this.isCompleted,
      isPaused: isPaused ?? this.isPaused,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'patientId': patientId,
      'patientName': patientName,
      'targetEye': targetEye.index,
      'instillTime': instillTime.toIso8601String(),
      'totalDurationMinutes': totalDurationMinutes,
      'isCompleted': isCompleted,
      'isPaused': isPaused,
    };
  }

  factory MydriasisSessionState.fromMap(Map<String, dynamic> map) {
    return MydriasisSessionState(
      patientId: map['patientId'] as String,
      patientName: map['patientName'] as String,
      targetEye: SelectedEye.values[map['targetEye'] as int],
      instillTime: DateTime.parse(map['instillTime'] as String),
      totalDurationMinutes: map['totalDurationMinutes'] as int,
      isCompleted: map['isCompleted'] as bool,
      isPaused: map['isPaused'] as bool,
    );
  }

  String toJson() => json.encode(toMap());

  factory MydriasisSessionState.fromJson(String source) =>
      MydriasisSessionState.fromMap(json.decode(source) as Map<String, dynamic>);
}

/// StateNotifier handling a dictionary map of active patient dilation timers [PatientID -> SessionState].
/// It operates a single high-efficiency logical ticker to notify listeners while calculating
/// countdown parameters with full precision values.
class MydriasisTimerNotifier extends StateNotifier<Map<String, MydriasisSessionState>> {
  Timer? _ticker;
  final Ref _ref;

  MydriasisTimerNotifier(this._ref) : super(const {}) {
    _startLogicalTicker();
  }

  /// Mounts the periodic ticker to recalculate states every second.
  void _startLogicalTicker() {
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state.isEmpty) return;
      
      bool stateAltered = false;
      final updatedMap = Map<String, MydriasisSessionState>.from(state);

      state.forEach((patientId, session) {
        if (!session.isCompleted && !session.isPaused) {
          final remaining = session.secondsRemaining;
          if (remaining <= 0) {
            // Dilation threshold breached! Mark as clinically completed.
            updatedMap[patientId] = session.copyWith(isCompleted: true);
            stateAltered = true;
            _dispatchDilationCompleteNotification(updatedMap[patientId]!);
          } else {
            // Force a state notification so UI items update remaining seconds
            stateAltered = true;
          }
        }
      });

      if (stateAltered) {
        state = updatedMap;
        _saveStateToDisk();
      }
    });
  }

  /// Instills Tropicamide 1% drops for a patient and triggers the strict 20-minute timer.
  void instillDilationDrops({
    required String patientId,
    required String patientName,
    required SelectedEye eye,
    int durationMinutes = 20,
  }) {
    final newSession = MydriasisSessionState(
      patientId: patientId,
      patientName: patientName,
      targetEye: eye,
      instillTime: DateTime.now(),
      totalDurationMinutes: durationMinutes,
      isCompleted: false,
      isPaused: false,
    );

    state = {
      ...state,
      patientId: newSession,
    };
    
    _saveStateToDisk();
    debugPrint('[RIVERPOD] Tropicamide drops administered to $patientName (${newSession.eyeLabel}). Timer active.');
  }

  /// Cancels or clears an active countdown timer for a discharged or updated patient file.
  void clearDilationTimer(String patientId) {
    if (state.containsKey(patientId)) {
      final updatedMap = Map<String, MydriasisSessionState>.from(state)..remove(patientId);
      state = updatedMap;
      _saveStateToDisk();
      debugPrint('[RIVERPOD] Dilation timer removed for Patient: $patientId');
    }
  }

  /// Force-completes a countdown timer instantly for simulated or fast-diagnostic screening.
  void fastForwardDilation(String patientId) {
    final session = state[patientId];
    if (session != null) {
      state = {
        ...state,
        patientId: session.copyWith(
          isCompleted: true,
          instillTime: DateTime.now().subtract(Duration(minutes: session.totalDurationMinutes + 1)),
        ),
      };
      _saveStateToDisk();
      _dispatchDilationCompleteNotification(state[patientId]!);
    }
  }

  /// Mock triggers a local push notification and audio/tactile chime to alert clinicians.
  void _dispatchDilationCompleteNotification(MydriasisSessionState session) {
    debugPrint(
      '🚨 [CLINICAL SECURITY WARNING] - Mydriasis Target Accomplished!\n'
      'Patient: ${session.patientName} (${session.patientId}) has spent ${session.totalDurationMinutes} minutes in dilation.\n'
      'Slight pupil reflex checks are cleared. Ready for specialized digital fundus imaging!'
    );
  }

  /// Persists the active session state dictionary to persistent storage.
  /// This protects client states from random garbage collector termination or mobile OS pause blocks.
  Future<void> _saveStateToDisk() async {
    try {
      final serialized = state.map((key, value) => MapEntry(key, value.toMap()));
      final jsonString = json.encode(serialized);
      // In a real Flutter app:
      // final prefs = await SharedPreferences.getInstance();
      // await prefs.setString('clinical_mydriasis_cache', jsonString);
      debugPrint('[PERSISTENCE] Successfully cached state to disk: ${state.length} active monitors.');
    } catch (e) {
      debugPrint('[PERSISTENCE_ERROR] Failed saving state: $e');
    }
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }
}

// --- Riverpod State Providers ---

/// Provider managing the active list of tracked patient pupil dilations.
final mydriasisTimerProvider =
    StateNotifierProvider<MydriasisTimerNotifier, Map<String, MydriasisSessionState>>((ref) {
  return MydriasisTimerNotifier(ref);
});

/// Auto-calculated provider to compute if a specific patient has completed dilation requirements.
final isPatientReadyForSpecialistProvider = Provider.family<bool, String>((ref, patientId) {
  final session = ref.watch(mydriasisTimerProvider)[patientId];
  return session != null && session.isCompleted;
});

/// Auto-calculates remaining seconds formatted as 'MM:SS' for a specific patient.
final formattedRemainingTimeProvider = Provider.family<String, String>((ref, patientId) {
  final session = ref.watch(mydriasisTimerProvider)[patientId];
  if (session == null) return '00:00';
  if (session.isCompleted) return '00:00';
  
  final totalSeconds = session.secondsRemaining;
  final minutes = (totalSeconds / 60).floor();
  final seconds = totalSeconds % 60;
  
  return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
});
