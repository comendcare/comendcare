import { faker } from "@faker-js/faker";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircle2,
  CircleHelp,
  CircleIcon,
  CircleX,
  Timer,
} from "lucide-react";
import { customAlphabet } from "nanoid";
import {Status, Priority, type Task} from "@prisma/client";

import { generateId } from "@comend/lib/id";
import {PRIORITIES, LABELS, STATUSES} from "@comend/components/types/data-table";

export function generateRandomTask(): Task {
  return {
    id: generateId("task"),
    code: `TASK-${customAlphabet("0123456789", 4)()}`,
    title: faker.hacker
      .phrase()
      .replace(/^./, (letter) => letter.toUpperCase()),
    estimatedHours: faker.number.int({ min: 1, max: 24 }),
    status: faker.helpers.shuffle(STATUSES)[0] ?? "todo",
    label: faker.helpers.shuffle(LABELS)[0] ?? "bug",
    priority: faker.helpers.shuffle(PRIORITIES)[0] ?? "low",
    archived: faker.datatype.boolean({ probability: 0.2 }),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function getStatusIcon(status: Status) {
  const statusIcons = {
    canceled: CircleX,
    done: CheckCircle2,
    "in_progress": Timer,
    todo: CircleHelp,
  };

  return statusIcons[status] || CircleIcon;
}

export function getPriorityIcon(priority: Priority) {
  const priorityIcons = {
    high: ArrowUpIcon,
    low: ArrowDownIcon,
    medium: ArrowRightIcon,
  };

  return priorityIcons[priority] || CircleIcon;
}
