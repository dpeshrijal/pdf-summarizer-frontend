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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              <div className="absolute inset-0 p-4 space-y-2 text-[6px]">
                {/* Header - Centered */}
                <div className="space-y-0.5 text-center">
                  <div className="font-bold text-foreground">JOHN DOE</div>
                  <div className="text-foreground/60">john.doe@email.com • (555) 123-4567 • New York, NY</div>
                  <div className="text-foreground/60">linkedin.com/in/johndoe • github.com/johndoe</div>
                </div>

                {/* Summary */}
                <div className="pt-1 space-y-0.5">
                  <div className="font-semibold text-foreground border-b border-foreground/30 pb-0.5">SUMMARY</div>
                  <div className="text-foreground/60 leading-tight">
                    Experienced Software Engineer with 5+ years building scalable applications. Proficient in full-stack development and cloud technologies.
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-1">
                  <div className="font-semibold text-foreground border-b border-foreground/30 pb-0.5">EXPERIENCE</div>
                  <div className="space-y-0.5">
                    <div className="font-medium text-foreground">Senior Software Engineer</div>
                    <div className="text-foreground/60 italic text-[5px]">Tech Corp • 2020 - Present</div>
                    <div className="flex gap-1">
                      <div className="text-foreground/60">•</div>
                      <div className="text-foreground/60 leading-tight flex-1 text-[5px]">Led development of microservices architecture</div>
                    </div>
                    <div className="flex gap-1">
                      <div className="text-foreground/60">•</div>
                      <div className="text-foreground/60 leading-tight flex-1 text-[5px]">Improved system performance by 40%</div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground border-b border-foreground/30 pb-0.5">SKILLS</div>
                  <div className="text-foreground/60 text-[5px]"><span className="font-medium text-foreground">Languages:</span> Python, JavaScript, TypeScript, Java</div>
                  <div className="text-foreground/60 text-[5px]"><span className="font-medium text-foreground">Technologies:</span> React, Node.js, AWS, Docker</div>
                </div>

                {/* Education */}
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground border-b border-foreground/30 pb-0.5">EDUCATION</div>
                  <div className="font-medium text-foreground text-[5px]">B.S. Computer Science</div>
                  <div className="text-foreground/60 italic text-[5px]">University of Technology, 2018</div>
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
              <div className="absolute inset-0 flex flex-col text-[6px]">
                {/* Dark Header */}
                <div className="h-[12%] bg-foreground/90 flex items-center justify-center">
                  <div className="space-y-0.5 text-center">
                    <div className="font-bold text-white text-[8px]">JOHN DOE</div>
                    <div className="text-white/80 text-[5px]">SOFTWARE ENGINEER</div>
                  </div>
                </div>

                <div className="flex flex-1">
                  {/* Light Sidebar with right-aligned text */}
                  <div className="w-[33%] bg-gray-100 p-2 space-y-2 flex flex-col items-end pr-1.5">
                    {/* Contact */}
                    <div className="space-y-0.5 text-right w-full">
                      <div className="font-semibold text-foreground text-[5px]">CONTACT</div>
                      <div className="h-px w-10 bg-foreground/30 ml-auto" />
                      <div className="text-foreground/60 text-[4.5px] leading-tight">john.doe@email.com</div>
                      <div className="text-foreground/60 text-[4.5px] leading-tight">(555) 123-4567</div>
                      <div className="text-foreground/60 text-[4.5px] leading-tight">New York, NY</div>
                      <div className="text-blue-600 text-[4.5px] leading-tight">linkedin.com/in/johndoe</div>
                    </div>

                    {/* Education */}
                    <div className="space-y-0.5 text-right w-full pt-0.5">
                      <div className="font-semibold text-foreground text-[5px]">EDUCATION</div>
                      <div className="h-px w-10 bg-foreground/30 ml-auto" />
                      <div className="font-medium text-foreground text-[4.5px] leading-tight">B.S. Computer Science</div>
                      <div className="text-foreground/60 text-[4.5px] leading-tight">University of Technology</div>
                      <div className="text-foreground/60 text-[4.5px] leading-tight">2018</div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-0.5 text-right w-full pt-0.5">
                      <div className="font-semibold text-foreground text-[5px]">SKILLS</div>
                      <div className="h-px w-10 bg-foreground/30 ml-auto" />
                      <div className="font-medium text-foreground text-[4.5px] leading-tight">Languages</div>
                      <div className="text-foreground/60 text-[4.5px] leading-tight">Python, JavaScript</div>
                      <div className="font-medium text-foreground text-[4.5px] leading-tight pt-0.5">Technologies</div>
                      <div className="text-foreground/60 text-[4.5px] leading-tight">React, Node.js, AWS</div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-2.5 space-y-2 pl-2">
                    {/* Summary */}
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground text-[5.5px]">SUMMARY</div>
                      <div className="h-px w-full bg-foreground/30" />
                      <div className="text-foreground/60 text-[5px] leading-tight">Experienced Software Engineer with 5+ years building scalable applications. Proficient in full-stack development and cloud technologies.</div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground text-[5.5px]">WORK EXPERIENCE</div>
                      <div className="h-px w-full bg-foreground/30" />
                      <div className="space-y-0.5">
                        <div className="font-medium text-foreground text-[5px]">Senior Software Engineer</div>
                        <div className="text-foreground/60 text-[4.5px] italic">Tech Corp, San Francisco • 2020 - Present</div>
                        <div className="flex gap-0.5 items-start">
                          <div className="text-foreground/60 text-[4.5px]">•</div>
                          <div className="text-foreground/60 text-[4.5px] leading-tight flex-1">Led development of microservices architecture</div>
                        </div>
                        <div className="flex gap-0.5 items-start">
                          <div className="text-foreground/60 text-[4.5px]">•</div>
                          <div className="text-foreground/60 text-[4.5px] leading-tight flex-1">Improved system performance by 40%</div>
                        </div>
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground text-[5.5px]">PROJECTS</div>
                      <div className="h-px w-full bg-foreground/30" />
                      <div className="font-medium text-foreground text-[5px]">E-Commerce Platform</div>
                      <div className="flex gap-0.5 items-start">
                        <div className="text-foreground/60 text-[4.5px]">•</div>
                        <div className="text-foreground/60 text-[4.5px] leading-tight flex-1">Built scalable platform serving 100K+ users</div>
                      </div>
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
                Professional design with dark header and light sidebar. Perfect for tech and creative roles.
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
