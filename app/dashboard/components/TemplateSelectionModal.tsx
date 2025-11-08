"use client";

import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TemplateType = 'classic' | 'fancy' | 'artistic';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: TemplateType;
  onTemplateSelect: (template: TemplateType) => void;
  onConfirmDownload: () => void;
}

export function TemplateSelectionModal({
  isOpen,
  onClose,
  selectedTemplate,
  onTemplateSelect,
  onConfirmDownload,
}: TemplateSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Choose Your Resume Style</DialogTitle>
          <DialogDescription className="text-center">
            Select a template that best represents your professional brand
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Classic Template */}
          <button
            onClick={() => onTemplateSelect('classic')}
            className={`group relative flex flex-col gap-4 p-6 rounded-2xl border-2 transition-all duration-300 bg-gradient-to-br from-background to-muted/30 ${
              selectedTemplate === 'classic'
                ? 'border-primary shadow-xl ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50 hover:shadow-lg'
            }`}
          >
            {/* Radio Button Indicator */}
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-10">
              {selectedTemplate === 'classic' ? (
                <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 bg-background" />
              )}
            </div>
            {/* Preview Image Placeholder */}
            <div className="relative w-full aspect-[8.5/11] bg-white rounded-lg shadow-lg overflow-hidden border border-border/50 z-0">
              <div className="absolute inset-0 p-6 space-y-3">
                {/* Header - Centered */}
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-foreground/80 rounded mx-auto" />
                  <div className="h-2 w-40 bg-foreground/40 rounded mx-auto" />
                </div>

                {/* Section 1 */}
                <div className="pt-3 space-y-2">
                  <div className="h-3 w-24 bg-foreground/70 rounded" />
                  <div className="h-px w-full bg-foreground/30" />
                  <div className="space-y-1.5 pt-2">
                    <div className="h-2 w-full bg-foreground/25 rounded" />
                    <div className="h-2 w-full bg-foreground/25 rounded" />
                    <div className="h-2 w-5/6 bg-foreground/25 rounded" />
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-2">
                  <div className="h-3 w-28 bg-foreground/70 rounded" />
                  <div className="h-px w-full bg-foreground/30" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-1.5 w-1.5 bg-foreground/40 rounded-full mt-1" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2 w-full bg-foreground/25 rounded" />
                      <div className="h-2 w-4/5 bg-foreground/25 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-center group-hover:text-primary transition-colors">
                Classic
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Traditional, clean design with centered layout. Perfect for corporate and formal positions.
              </p>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

          {/* Fancy Template */}
          <button
            onClick={() => onTemplateSelect('fancy')}
            className={`group relative flex flex-col gap-4 p-6 rounded-2xl border-2 transition-all duration-300 bg-gradient-to-br from-background to-muted/30 ${
              selectedTemplate === 'fancy'
                ? 'border-primary shadow-xl ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50 hover:shadow-lg'
            }`}
          >
            {/* Radio Button Indicator */}
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-10">
              {selectedTemplate === 'fancy' ? (
                <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 bg-background" />
              )}
            </div>
            {/* Preview Image Placeholder */}
            <div className="relative w-full aspect-[8.5/11] bg-white rounded-lg shadow-lg overflow-hidden border border-border/50 z-0">
              <div className="absolute inset-0 flex">
                {/* Dark Sidebar */}
                <div className="w-[35%] bg-foreground/90 p-3 space-y-3">
                  {/* Contact */}
                  <div className="space-y-1.5">
                    <div className="h-2 w-16 bg-white/90 rounded" />
                    <div className="h-1 w-full bg-white/50 rounded" />
                    <div className="h-1 w-full bg-white/50 rounded" />
                    <div className="h-1 w-4/5 bg-white/50 rounded" />
                  </div>

                  {/* Skills */}
                  <div className="space-y-1.5 pt-2">
                    <div className="h-2 w-12 bg-white/90 rounded" />
                    <div className="h-1 w-full bg-white/50 rounded" />
                    <div className="h-1 w-3/4 bg-white/50 rounded" />
                  </div>

                  {/* Education */}
                  <div className="space-y-1.5 pt-2">
                    <div className="h-2 w-20 bg-white/90 rounded" />
                    <div className="h-1 w-full bg-white/50 rounded" />
                    <div className="h-1 w-5/6 bg-white/50 rounded" />
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-3 space-y-3">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 bg-foreground/80 rounded" />
                    <div className="h-2 w-24 bg-foreground/40 rounded" />
                  </div>

                  {/* Experience */}
                  <div className="space-y-2 pt-2">
                    <div className="h-3 w-24 bg-foreground/70 rounded" />
                    <div className="h-px w-full bg-foreground/30" />
                    <div className="space-y-1 pt-1">
                      <div className="h-2 w-full bg-foreground/25 rounded" />
                      <div className="h-2 w-full bg-foreground/25 rounded" />
                      <div className="h-2 w-4/5 bg-foreground/25 rounded" />
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-foreground/70 rounded" />
                    <div className="h-px w-full bg-foreground/30" />
                    <div className="space-y-1 pt-1">
                      <div className="h-2 w-full bg-foreground/25 rounded" />
                      <div className="h-2 w-5/6 bg-foreground/25 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-center group-hover:text-primary transition-colors">
                Fancy
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Modern sidebar layout with dark accent. Great for creative and tech roles.
              </p>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            More stunning templates coming soon
          </p>
        </div>

        {/* Download Button */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirmDownload}
            className="px-8 shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Resume
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
