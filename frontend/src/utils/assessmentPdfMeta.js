export function formatPdfDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function buildAssessmentPdfMetadata({ assignment, testName }) {
  const employeeFirstName =
    assignment?.employee_first_name || assignment?.recruitee?.first_name || "";
  const employeeLastName =
    assignment?.employee_last_name || assignment?.recruitee?.last_name || "";

  const fullName =
    assignment?.employee_full_name ||
    `${employeeFirstName} ${employeeLastName}`.trim() ||
    assignment?.recruitee?.email ||
    assignment?.employee?.email ||
    "-";

  return {
    testName: testName || assignment?.template_name || assignment?.template?.name || "Assessment",
    assignmentDate: formatPdfDate(assignment?.assigned_at),
    completionDate: formatPdfDate(assignment?.completed_at),
    employeeName: fullName,
  };
}
