// Model-first incident state management (Architecture Decision 3).
// Honest offline states (Architecture Decision 6):
//   pending   -> created offline, not yet transmitted
//   sent      -> transmitted to backend (simulated), awaiting responder
//   acknowledged -> responder has seen / accepted the incident
//   resolved  -> closed by responder or admin

enum IncidentType { medical, fire, security, naturalDisaster, other }

extension IncidentTypeX on IncidentType {
  String get label {
    switch (this) {
      case IncidentType.medical:
        return 'Medical';
      case IncidentType.fire:
        return 'Fire';
      case IncidentType.security:
        return 'Security';
      case IncidentType.naturalDisaster:
        return 'Natural Disaster';
      case IncidentType.other:
        return 'Other';
    }
  }
}

enum IncidentStatus { pending, sent, acknowledged, resolved }

extension IncidentStatusX on IncidentStatus {
  String get label {
    switch (this) {
      case IncidentStatus.pending:
        return 'Pending transmission';
      case IncidentStatus.sent:
        return 'Sent';
      case IncidentStatus.acknowledged:
        return 'Acknowledged';
      case IncidentStatus.resolved:
        return 'Resolved';
    }
  }

  bool get isPending => this == IncidentStatus.pending;
}

class Incident {
  final String id;
  final String reporterId;
  final String reporterName;
  final IncidentType type;
  final String description;
  final double? latitude;
  final double? longitude;
  final String? locationLabel;
  final String? photoPath;
  final IncidentStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? acknowledgedBy;

  const Incident({
    required this.id,
    required this.reporterId,
    required this.reporterName,
    required this.type,
    required this.description,
    this.latitude,
    this.longitude,
    this.locationLabel,
    this.photoPath,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.acknowledgedBy,
  });

  Incident copyWith({
    IncidentStatus? status,
    String? description,
    double? latitude,
    double? longitude,
    String? locationLabel,
    String? photoPath,
    DateTime? updatedAt,
    String? acknowledgedBy,
  }) {
    return Incident(
      id: id,
      reporterId: reporterId,
      reporterName: reporterName,
      type: type,
      description: description ?? this.description,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      locationLabel: locationLabel ?? this.locationLabel,
      photoPath: photoPath ?? this.photoPath,
      status: status ?? this.status,
      createdAt: createdAt,
      updatedAt: updatedAt ?? DateTime.now(),
      acknowledgedBy: acknowledgedBy ?? this.acknowledgedBy,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'reporterId': reporterId,
      'reporterName': reporterName,
      'type': type.index,
      'description': description,
      'latitude': latitude,
      'longitude': longitude,
      'locationLabel': locationLabel,
      'photoPath': photoPath,
      'status': status.index,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'acknowledgedBy': acknowledgedBy,
    };
  }

  factory Incident.fromMap(Map<dynamic, dynamic> map) {
    return Incident(
      id: map['id'] as String,
      reporterId: map['reporterId'] as String? ?? 'unknown',
      reporterName: map['reporterName'] as String? ?? 'Unknown',
      type: IncidentType.values[(map['type'] as int?) ?? 4],
      description: map['description'] as String? ?? '',
      latitude: (map['latitude'] as num?)?.toDouble(),
      longitude: (map['longitude'] as num?)?.toDouble(),
      locationLabel: map['locationLabel'] as String?,
      photoPath: map['photoPath'] as String?,
      status: IncidentStatus.values[(map['status'] as int?) ?? 0],
      createdAt:
          DateTime.tryParse(map['createdAt'] as String? ?? '') ?? DateTime.now(),
      updatedAt:
          DateTime.tryParse(map['updatedAt'] as String? ?? '') ?? DateTime.now(),
      acknowledgedBy: map['acknowledgedBy'] as String?,
    );
  }
}
