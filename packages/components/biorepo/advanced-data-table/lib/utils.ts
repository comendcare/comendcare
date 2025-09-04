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
import { Prisma, Label, Priority, Status, type Task } from "@prisma/client";

import { generateId } from "./../../../../../packages/lib/id";
import {PRIORITIES, LABELS, STATUSES} from "./../../../types/data-table";

export function generateRandomTask(): Task {
  return {
    id: generateId("task"),
    name: faker.commerce.productName(),
    code: `TASK-${customAlphabet("0123456789", 4)()}`,
    title: faker.hacker
        .phrase()
        .replace(/^./, (letter) => letter.toUpperCase()),
    description: faker.lorem.sentence(),
    milestoneId: faker.datatype.boolean() ? generateId("milestone") : null,
    kanbanPosition: faker.number.int({ min: 1, max: 100 }),
    orderPosition: faker.number.int({ min: 1, max: 100 }),
    columnId: generateId("column"),
    estimatedHours: faker.number.int({ min: 1, max: 24 }),
    status: faker.helpers.shuffle(Object.values(Status))[0] ?? "todo",
    label: faker.helpers.shuffle(Object.values(Label))[0] ?? "bug",
    priority: faker.helpers.shuffle(Object.values(Priority))[0] ?? "low",
    archived: faker.datatype.boolean({ probability: 0.2 }),
    createdAt: new Date(),
    updatedAt: new Date(),
    date: faker.date.recent(),
    endDate: faker.date.soon(),
    startDate: faker.date.recent(),
    private: faker.datatype.boolean(),
    metadata: faker.datatype.boolean() ? { source: "seed" } : null,
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
