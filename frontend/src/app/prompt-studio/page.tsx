"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Send,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { promptTemplateSchema, type PromptTemplateInput } from "@/lib/auth/schema";
import {
  usePrompts,
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
} from "@/lib/hooks/use-prompts";
import { useUser } from "@/lib/hooks/use-user";
import { storage } from "@/lib/utils/storage";
import type { PromptTemplate } from "@/lib/api/prompts.api";

function truncate(str: string, maxLen: number) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + "…";
}

export default function PromptStudioPage() {
  const router = useRouter();
  const { data: userData } = useUser();
  const isLoggedIn = !!userData?.user;

  const { data: promptsData, isLoading: promptsLoading } = usePrompts(isLoggedIn);
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const deletePrompt = useDeletePrompt();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<PromptTemplate | null>(
    null
  );

  const formCreate = useForm<PromptTemplateInput>({
    resolver: zodResolver(promptTemplateSchema),
    defaultValues: { name: "", template: "" },
  });
  const formEdit = useForm<PromptTemplateInput>({
    resolver: zodResolver(promptTemplateSchema),
    defaultValues: { name: "", template: "" },
  });

  const handleCreateOpen = () => {
    formCreate.reset({ name: "", template: "" });
    setCreateOpen(true);
  };
  const handleCreateSubmit = (data: PromptTemplateInput) => {
    createPrompt.mutate(data, {
      onSuccess: () => {
        setCreateOpen(false);
        formCreate.reset();
      },
    });
  };

  const handleEditOpen = (prompt: PromptTemplate) => {
    setEditingPrompt(prompt);
    formEdit.reset({ name: prompt.name, template: prompt.template });
  };
  const handleEditSubmit = (data: PromptTemplateInput) => {
    if (!editingPrompt) return;
    updatePrompt.mutate(
      { id: editingPrompt.id, data },
      {
        onSuccess: () => {
          setEditingPrompt(null);
          formEdit.reset();
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deletingPrompt) return;
    deletePrompt.mutate(deletingPrompt.id, {
      onSuccess: () => setDeletingPrompt(null),
    });
  };

  const handleUseInGenerator = (template: string) => {
    storage.setGeneratorPrompt(template);
    router.push("/");
  };

  const prompts = promptsData?.prompts ?? [];

  // Not logged in: show CTA to sign in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <section className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
              Prompt Studio
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              Create, save, and reuse prompts for faster video generation
            </p>
          </section>
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-center">Sign in to use Prompt Studio</CardTitle>
              <CardDescription className="text-center">
                Save and manage your prompts, then send them to the generator in one click.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <section className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
              Prompt Studio
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              Create, save, and reuse prompts. Send any prompt to the generator in one click.
            </p>
          </div>
          <Button onClick={handleCreateOpen} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            New prompt
          </Button>
        </section>

        {promptsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="size-8 text-primary" />
          </div>
        ) : prompts.length === 0 ? (
          <Card className="border-border/80">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No prompts yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Create a prompt to save it here. You can then send it to the generator anytime.
              </p>
              <Button onClick={handleCreateOpen} className="gap-2">
                <Plus className="w-4 h-4" />
                Create your first prompt
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4">
            {prompts.map((prompt) => (
              <li key={prompt.id}>
                <Card className="border-border/80 overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base truncate">
                          {prompt.name}
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-2 text-sm">
                          {truncate(prompt.template, 120)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditOpen(prompt)}
                          aria-label="Edit prompt"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingPrompt(prompt)}
                          aria-label="Delete prompt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleUseInGenerator(prompt.template)}
                    >
                      <Send className="w-4 h-4" />
                      Use in Generator
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New prompt</DialogTitle>
            <DialogDescription>
              Give it a name and enter the prompt text. You can send it to the generator later.
            </DialogDescription>
          </DialogHeader>
          <Form {...formCreate}>
            <form
              onSubmit={formCreate.handleSubmit(handleCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={formCreate.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Product launch"
                        {...field}
                        disabled={createPrompt.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formCreate.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g., A professional product launch video for a new smartphone..."
                        className="min-h-32 resize-none"
                        {...field}
                        disabled={createPrompt.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      10–2000 characters
                    </p>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  disabled={createPrompt.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createPrompt.isPending}>
                  {createPrompt.isPending ? (
                    <Spinner className="size-4" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={(open) => !open && setEditingPrompt(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit prompt</DialogTitle>
            <DialogDescription>
              Update the name or prompt text.
            </DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={formEdit.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Product launch"
                        {...field}
                        disabled={updatePrompt.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Prompt text..."
                        className="min-h-32 resize-none"
                        {...field}
                        disabled={updatePrompt.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingPrompt(null)}
                  disabled={updatePrompt.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePrompt.isPending}>
                  {updatePrompt.isPending ? (
                    <Spinner className="size-4" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingPrompt} onOpenChange={(open) => !open && setDeletingPrompt(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingPrompt?.name}&quot;. You can&apos;t undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePrompt.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletePrompt.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePrompt.isPending ? <Spinner className="size-4" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
