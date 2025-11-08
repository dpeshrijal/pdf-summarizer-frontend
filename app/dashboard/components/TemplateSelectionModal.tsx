"use client";

import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Choose Your Resume Style
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            Select a template that best represents your professional brand
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Classic Template */}
          <button
            onClick={() => onTemplateSelect('classic')}
            className={`relative group text-left transition-all duration-300 ${
              selectedTemplate === 'classic'
                ? 'ring-2 ring-primary shadow-xl scale-[1.02]'
                : 'hover:shadow-lg hover:scale-[1.01]'
            } rounded-xl overflow-hidden`}
          >
            {/* Radio Button */}
            <div className="absolute top-4 right-4 z-10">
              {selectedTemplate === 'classic' ? (
                <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 bg-background" />
              )}
            </div>

            {/* Preview */}
            <div className="relative w-full aspect-[8.5/11] bg-white rounded-lg shadow-lg overflow-hidden border border-border/50 z-0">
              {/* Classic template preview mockup */}
              <div className="p-6 space-y-3">
                <div className="text-center border-b-2 border-gray-800 pb-3">
                  <div className="h-4 bg-gray-800 w-32 mx-auto mb-1"></div>
                  <div className="h-2 bg-gray-400 w-24 mx-auto"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-300 w-full"></div>
                  <div className="h-2 bg-gray-300 w-5/6"></div>
                  <div className="h-2 bg-gray-300 w-4/6"></div>
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="mt-3 text-center">
              <h3 className="font-semibold text-base">Classic</h3>
              <p className="text-xs text-muted-foreground">Traditional & Professional</p>
            </div>
          </button>

          {/* Fancy Template */}
          <button
            onClick={() => onTemplateSelect('fancy')}
            className={`relative group text-left transition-all duration-300 ${
              selectedTemplate === 'fancy'
                ? 'ring-2 ring-primary shadow-xl scale-[1.02]'
                : 'hover:shadow-lg hover:scale-[1.01]'
            } rounded-xl overflow-hidden`}
          >
            {/* Radio Button */}
            <div className="absolute top-4 right-4 z-10">
              {selectedTemplate === 'fancy' ? (
                <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 bg-background" />
              )}
            </div>

            {/* Preview */}
            <div className="relative w-full aspect-[8.5/11] bg-white rounded-lg shadow-lg overflow-hidden border border-border/50 z-0">
              {/* Fancy template preview mockup */}
              <div className="flex h-full">
                <div className="w-1/3 bg-gray-200 p-3 space-y-2">
                  <div className="h-2 bg-gray-600 w-full"></div>
                  <div className="h-2 bg-gray-600 w-4/5"></div>
                </div>
                <div className="flex-1 p-4 space-y-2">
                  <div className="bg-gray-800 h-8 -mt-4 -ml-4 -mr-4 mb-2"></div>
                  <div className="h-2 bg-gray-300 w-full"></div>
                  <div className="h-2 bg-gray-300 w-5/6"></div>
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="mt-3 text-center">
              <h3 className="font-semibold text-base">Fancy</h3>
              <p className="text-xs text-muted-foreground">Modern with Sidebar</p>
            </div>
          </button>

          {/* Artistic Template */}
          <button
            onClick={() => onTemplateSelect('artistic')}
            className={`relative group text-left transition-all duration-300 ${
              selectedTemplate === 'artistic'
                ? 'ring-2 ring-primary shadow-xl scale-[1.02]'
                : 'hover:shadow-lg hover:scale-[1.01]'
            } rounded-xl overflow-hidden`}
          >
            {/* Radio Button */}
            <div className="absolute top-4 right-4 z-10">
              {selectedTemplate === 'artistic' ? (
                <div className="w-6 h-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 bg-background" />
              )}
            </div>

            {/* Preview */}
            <div className="relative w-full aspect-[8.5/11] bg-white rounded-lg shadow-lg overflow-hidden border border-border/50 z-0">
              {/* Artistic template preview mockup */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-700 w-24 mb-1"></div>
                    <div className="h-2 bg-gray-400 w-32"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-300 w-full"></div>
                  <div className="h-2 bg-gray-300 w-5/6"></div>
                </div>
              </div>
            </div>

            {/* Label */}
            <div className="mt-3 text-center">
              <h3 className="font-semibold text-base">Artistic</h3>
              <p className="text-xs text-muted-foreground">Creative & Eye-catching</p>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            size="lg"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirmDownload}
            size="lg"
            className="min-w-[200px]"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Resume
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
