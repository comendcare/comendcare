"use server";

import { customAlphabet } from "nanoid";
import { revalidateTag, unstable_noStore } from "next/cache";
import prisma from "@comend/lib/prisma"
import { type Task, Label, Priority, Status } from "@prisma/client";
import { getErrorMessage } from "@comend/lib/handle-error";
import { generateRandomTask } from "./utils";
import type { CreateTaskSchema, UpdateTaskSchema } from "./validations";

// ─────────────────────────────────────────────
// Seed Tasks
// ─────────────────────────────────────────────

export async function seedTasks({ count = 100 }: { count: number }) {
  try {
    const tasks = Array.from({ length: count }, generateRandomTask);

    await prisma.task.deleteMany(); // Clear old tasks
    console.log("📝 Inserting tasks", tasks.length);
    await prisma.task.createMany({ data: tasks, skipDuplicates: true });
  } catch (err) {
    console.error(err);
  }
}

// ─────────────────────────────────────────────
// Create Task
// ─────────────────────────────────────────────

export async function createTask(input: CreateTaskSchema) {
  unstable_noStore();

  try {
    await prisma.$transaction(async (tx) => {
      const newTask = await tx.task.create({
        data: {
          code: `TASK-${customAlphabet("0123456789", 4)()}`,
          title: input.title,
          status: input.status,
          label: input.label,
          priority: input.priority,
        },
        select: { id: true },
      });

      const oldest = await tx.task.findFirst({
        where: { NOT: { id: newTask.id } },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (oldest) {
        await tx.task.delete({ where: { id: oldest.id } });
      }
    });

    revalidateTag("tasks");
    revalidateTag("task-status-counts");
    revalidateTag("task-priority-counts");

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}

// ─────────────────────────────────────────────
// Update Single Task
// ─────────────────────────────────────────────

export async function updateTask(input: UpdateTaskSchema & { id: string }) {
  unstable_noStore();

  try {
    const updated = await prisma.task.update({
      where: { id: input.id },
      data: {
        title: input.title,
        label: input.label,
        status: input.status,
        priority: input.priority,
      },
      select: {
        status: true,
        priority: true,
      },
    });

    revalidateTag("tasks");
    if (updated.status === input.status) revalidateTag("task-status-counts");
    if (updated.priority === input.priority) revalidateTag("task-priority-counts");

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}

// ─────────────────────────────────────────────
// Update Multiple Tasks
// ─────────────────────────────────────────────

export async function updateTasks(input: {
  ids: string[];
  label?: Label;
  status?: Status;
  priority?: Priority;
}) {
  unstable_noStore();

  try {
    await prisma.task.updateMany({
      where: { id: { in: input.ids } },
      data: {
        ...(input.label && { label: input.label }),
        ...(input.status && { status: input.status }),
        ...(input.priority && { priority: input.priority }),
      },
    });

    revalidateTag("tasks");
    if (input.status) revalidateTag("task-status-counts");
    if (input.priority) revalidateTag("task-priority-counts");

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}

// ─────────────────────────────────────────────
// Delete Single Task
// ─────────────────────────────────────────────

export async function deleteTask({ id }: { id: string }) {
  unstable_noStore();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id } });
      await tx.task.create({ data: generateRandomTask() });
    });

    revalidateTag("tasks");
    revalidateTag("task-status-counts");
    revalidateTag("task-priority-counts");

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}

// ─────────────────────────────────────────────
// Delete Multiple Tasks
// ─────────────────────────────────────────────

export async function deleteTasks({ ids }: { ids: string[] }) {
  unstable_noStore();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.task.deleteMany({ where: { id: { in: ids } } });
      await tx.task.createMany({
        data: ids.map(() => generateRandomTask()),
      });
    });

    revalidateTag("tasks");
    revalidateTag("task-status-counts");
    revalidateTag("task-priority-counts");

    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: getErrorMessage(err) };
  }
}
