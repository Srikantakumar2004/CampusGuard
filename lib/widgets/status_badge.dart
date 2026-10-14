import 'package:flutter/material.dart';

import '../models/incident.dart';

class StatusBadge extends StatelessWidget {
  final IncidentStatus status;
  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (bg, fg, icon) = switch (status) {
      IncidentStatus.pending => (
          Colors.orange.shade100,
          Colors.orange.shade900,
          Icons.cloud_off_outlined
        ),
      IncidentStatus.sent => (
          Colors.blue.shade100,
          Colors.blue.shade900,
          Icons.cloud_done_outlined
        ),
      IncidentStatus.acknowledged => (
          Colors.green.shade100,
          Colors.green.shade900,
          Icons.verified_outlined
        ),
      IncidentStatus.resolved => (
          Colors.grey.shade200,
          Colors.grey.shade800,
          Icons.check_circle_outline
        ),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: fg),
          const SizedBox(width: 6),
          Text(
            status.label,
            style: TextStyle(
              color: fg,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
