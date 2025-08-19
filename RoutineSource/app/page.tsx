import React from "react";

const routine = [
	{
		day: "Sunday",
		slots: [
			"",
			"Stat - 3205 JHK R#430",
			"Algo - 3203 MTA R#430",
			"Break",
			"SDP Lab - 3216 MFA+MRR [GA] R#706",
			"",
		],
	},
	{
		day: "Monday",
		slots: [
			"Algo - 3203 MTA R#430",
			"OS - 3201 MHK R#430",
			"Automata - 3204 MMK R#430",
			"Break",
			"",
			"",
		],
	},
	{
		day: "Tuesday",
		slots: [
			"Stat - 3205 JHK R#430",
			"Num. Method - 3202 PR R#430",
			"OS - 3201 MHK R#430",
			"Break",
			"Writing and Presentation Lab - 3217 SP+Mlb [GA/GB] R#707",
			"",
		],
	},
	{
		day: "Wednesday",
		slots: [
			"Num. Method- 3202 PR R#430",
			"OS Lab - 3211 MHK+JA [GA] R#706",
			"",
			"Break",
			"OS Lab - 3211 MHK+JA [GB] R#709",
			"",
		],
	},
	{
		day: "Thursday",
		slots: [
			"SDP Lab - 3216 MFA+MRR [GB] R#704",
			"",
			"Automata - 3204 MMK R#430",
			"Break",
			"Num. Methods Lab - 3212 PR+Mlb [GA/GB] R#707",
			"",
		],
	},
];

const times = [
	"8:30 - 10AM",
	"10:00-11:30AM",
	"11:30AM-1PM",
	"1:00-2:00PM",
	"2:00-3:30PM",
	"3:30-5:00PM",
];

const courses = [
	{
		code: "CSE 3201",
		name: "Operating Systems",
		teacher: "Mosaddek Hossain Kamal",
	},
	{ code: "CSE 3202", name: "Numerical Methods", teacher: "Palash Roy" },
	{
		code: "CSE 3203",
		name: "Design and Analysis of Algorithms - II",
		teacher: "Md. Tanvir Alam",
	},
	{
		code: "CSE 3204",
		name: "Formal Language, Automata and Computability",
		teacher: "Md. Mosaddek Khan",
	},
	{
		code: "CSE 3205",
		name: "Introduction to Probability and Statistics",
		teacher: "Dr. Md. Jamil Hasan Karami, Statistics",
	},
	{
		code: "CSE 3211",
		name: "Operating Systems Lab",
		teacher: "Mosaddek Hossain Kamal + Jargis Ahmed",
	},
	{
		code: "CSE 3212",
		name: "Numerical Methods Lab",
		teacher: "Palash Roy + Muhammad Ibrahim",
	},
	{
		code: "CSE 3216",
		name: "Software Design Patterns Lab",
		teacher: "Md. Fahim Arefin + Md. Mahmudur Rahman",
	},
	{
		code: "CSE 3217",
		name: "Technical Writing and Presentation Lab",
		teacher: "Suraiya Parvin + Muhammad Ibrahim",
	},
];

// Helper to find course info from slot string
function getCourse(slot: string) {
	if (!slot) return null;
	return courses.find((c) => {
		const codeDigits = c.code.match(/\d{4}/)?.[0];
		return (
			slot.toLowerCase().includes(c.code.replace(/\s+/g, "").toLowerCase()) ||
			(codeDigits && slot.includes(codeDigits)) ||
			slot.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])
		);
	});
}

// Tooltip for course info
function CourseTooltip({
	course,
	position,
}: {
	course: typeof courses[0];
	position: "top" | "bottom";
}) {
	return (
		<div
			className={`absolute left-1/2 ${
				position === "bottom" ? "bottom-full mb-2" : "top-full mt-2"
			} z-10 w-max min-w-[220px] -translate-x-1/2 px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg`}
			style={{
				background: "var(--color-tooltip-bg)",
				color: "var(--color-tooltip-text)",
			}}
		>
			<div className="font-bold" style={{ color: "var(--color-tooltip-code)" }}>
				{course.code}
			</div>
			<div className="mb-1">{course.name}</div>
			<div className="text-xs" style={{ color: "var(--color-tooltip-text)" }}>
				Teacher: {course.teacher}
			</div>
		</div>
	);
}

// Table cell for routine
function RoutineCell({
	slot,
	i,
	rowIdx,
	isLabMerged,
	isBreakMerged,
	showCell,
}: {
	slot: string;
	i: number;
	rowIdx: number;
	isLabMerged: boolean;
	isBreakMerged: boolean;
	showCell: boolean;
}) {
	const course = getCourse(slot);
	const position = rowIdx >= routine.length - 2 ? "bottom" : "top";
	if (!showCell) return null;

	if (isBreakMerged) {
		return (
			<td
				key={`break-${i}`}
				rowSpan={routine.length}
				className="px-1 py-2 border-b text-center font-bold align-middle"
				style={{
					background: "var(--color-table-break-cell-bg)",
					width: "70px",
					borderColor: "var(--color-table-border)",
				}}
			>
				Break
			</td>
		);
	}

	if (isLabMerged) {
		return (
			<td
				key={i}
				colSpan={2}
				className="relative group px-3 py-2 border-b text-center font-bold cursor-pointer"
				style={{
					background: "var(--color-table-lab-bg)",
					borderColor: "var(--color-table-border)",
				}}
			>
				{slot}
				{course && <CourseTooltip course={course} position={position} />}
			</td>
		);
	}

	return (
		<td
			key={i}
			className={`relative group px-3 py-2 border-b text-center ${
				times[i].includes("Break") || slot === "Break" ? "font-bold" : ""
			} ${slot ? "cursor-pointer" : ""}`}
			style={{
				background:
					times[i].includes("Break") || slot === "Break"
						? "var(--color-table-break-cell-bg)"
						: slot
						? "var(--color-table-bg)"
						: "var(--color-table-bg)",
				color: slot ? "var(--color-foreground)" : "var(--color-table-empty)",
				borderColor: "var(--color-table-border)",
			}}
		>
			{slot === "Break"
				? "Break"
				: slot || <span style={{ color: "var(--color-table-empty)" }}>—</span>}
			{course && <CourseTooltip course={course} position={position} />}
		</td>
	);
}

// Routine Table
function RoutineTable() {
	return (
		<div className="overflow-x-auto rounded-lg shadow">
			<table
				className="min-w-full border"
				style={{
					background: "var(--color-table-bg)",
					borderColor: "var(--color-table-border)",
				}}
			>
				<thead>
					<tr>
						<th
							className="px-3 py-2 border-b text-left"
							style={{
								background: "var(--color-table-header-bg)",
								borderColor: "var(--color-table-border)",
							}}
						>
							Day
						</th>
						{times.map((t) => (
							<th
								key={t}
								className="px-3 py-2 border-b text-center"
								style={{
									background: t.includes("Break")
										? "var(--color-table-break-bg)"
										: "var(--color-table-header-bg)",
									fontWeight: t.includes("Break") ? "bold" : undefined,
									width: t.includes("Break") ? "70px" : undefined,
									borderColor: "var(--color-table-border)",
								}}
							>
								{t}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{routine.map((row, rowIdx) => (
						<tr
							key={row.day}
							className="hover:bg-gray-50"
							style={{
								background: "var(--color-table-bg)",
							}}
						>
							<td
								className="px-3 py-2 border-b font-semibold"
								style={{ borderColor: "var(--color-table-border)" }}
							>
								{row.day}
							</td>
							{row.slots.map((slot, i) => {
								// Vertically merge the "Break" column
								const isBreakMerged = i === 3 && rowIdx === 0;
								if (i === 3 && rowIdx !== 0) return null;

								// Merge any "Lab" cell with next empty slot
								const isLabMerged = Boolean(
									slot &&
									slot.toLowerCase().includes("lab") &&
									(!row.slots[i + 1] || row.slots[i + 1] === "")
								);

								// Skip the next cell if previous was merged
								const showCell =
									!(i > 0 &&
										row.slots[i - 1] &&
										row.slots[i - 1].toLowerCase().includes("lab") &&
										(!row.slots[i] || row.slots[i] === ""));

								return (
									<RoutineCell
										key={i}
										slot={slot}
										i={i}
										rowIdx={rowIdx}
										isLabMerged={isLabMerged}
										isBreakMerged={isBreakMerged}
										showCell={showCell}
									/>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

// Course Info Cards
function CourseInfo() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{courses.map((course) => (
				<div
					key={course.code}
					className="rounded-lg shadow p-4 border"
					style={{
						background: "var(--color-course-card-bg)",
						borderColor: "var(--color-course-card-border)",
						boxShadow: `0 2px 8px 0 ${"var(--color-course-card-shadow)"}`,
					}}
				>
					<div className="font-bold" style={{ color: "var(--color-course-code)" }}>
						{course.code}
					</div>
					<div style={{ color: "var(--color-foreground)" }}>{course.name}</div>
					<div className="text-sm mt-1" style={{ color: "var(--color-course-teacher)" }}>
						{course.teacher}
					</div>
				</div>
			))}
		</div>
	);
}

export default function Page() {
	return (
		<main
			className="min-h-screen px-4 py-8"
			style={{
				background: "var(--background)",
				color: "var(--color-foreground)",
			}}
		>
			<div className="max-w-[90vw] mx-auto">
				<h1
					className="text-3xl font-bold text-center mb-6"
					style={{ color: "var(--color-title)" }}
				>
					3rd Year 2nd Semester Class Routine
				</h1>
				<RoutineTable />
				<h2
					className="text-xl font-semibold mt-10 mb-4"
					style={{ color: "var(--color-section-title)" }}
				>
					Course Information
				</h2>
				<CourseInfo />
			</div>
		</main>
	);
}