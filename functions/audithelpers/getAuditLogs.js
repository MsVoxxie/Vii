module.exports = async (guild, AuditLogEvent) => {
	const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent });
	const auditLog = auditLogs.entries.first();
	if (!auditLog) return null;
	return auditLog;
};
