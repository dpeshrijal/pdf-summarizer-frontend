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
              <div className="absolute inset-0 p-3 space-y-1.5 text-[5.5px]">
                {/* Header - Centered */}
                <div className="space-y-0.5 text-center">
                  <div className="font-bold text-foreground text-[8px]">JOHN DOE</div>
                  <div className="text-foreground/60 text-[4.5px]">john.doe@email.com • (555) 123-4567 • New York, NY</div>
                  <div className="text-foreground/60 text-[4.5px]">linkedin.com/in/johndoe • github.com/johndoe</div>
                </div>

                {/* Summary - LEFT ALIGNED */}
                <div className="pt-1 space-y-0.5 text-left">
                  <div className="font-semibold text-foreground border-b border-foreground/30 pb-0.5 text-[5.5px]">SUMMARY</div>
                  <div className="text-foreground/60 leading-tight text-[4.5px]">
                    Results-driven Senior Software Engineer with 7+ years of experience designing and implementing scalable, high-performance web applications. Proven track record of leading cross-functional teams, architecting microservices solutions, and delivering products that serve millions of users. Expertise in full-stack development, cloud infrastructure, and modern DevOps practices.
                  </div>
                </div>

                {/* Experience - LEFT ALIGNED */}
                <div className="space-y-1 text-left">
                  <div className="font-semibold text-foreground border-b border-foreground/30 pb-0.5 text-[5.5px]">WORK EXPERIENCE</div>
                  <div className="space-y-0.5">
                    <div className="font-medium text-foreground text-[5px]">Senior Software Engineer</div>
                    <div className="text-foreground/60 text-[4.5px]">Tech Corp, San Francisco, CA</div>
                    <div className="text-foreground/60 italic text-[4.5px]">January 2020 - Present</div>
                    <div className="flex gap-1 items-start">
                      <div className="text-foreground/60 text-[4.5px]">•</div>
                      <div className="text-foreground/60 leading-tight flex-1 text-[4.5px]">Led development of microservices architecture using Node.js and Docker, successfully migrating monolithic application to serve 2M+ daily active users with 99.9% uptime</div>
                    </div>
                    <div className="flex gap-1 items-start">
                      <div className="text-foreground/60 text-[4.5px]">•</div>
                      <div className="text-foreground/60 leading-tight flex-1 text-[4.5px]">Architected and implemented real-time data processing pipeline using Apache Kafka and Redis, reducing latency by 65% and improving user experience across platform</div>
                    </div>
                    <div className="flex gap-1 items-start">
                      <div className="text-foreground/60 text-[4.5px]">•</div>
                      <div className="text-foreground/60 leading-tight flex-1 text-[4.5px]">Mentored team of 5 junior developers through code reviews, pair programming sessions, and technical workshops, resulting in 40% improvement in code quality metrics</div>
                    </div>
                    <div className="flex gap-1 items-start">
                      <div className="text-foreground/60 text-[4.5px]">•</div>
                      <div className="text-foreground/60 leading-tight flex-1 text-[4.5px]">Optimized database queries and implemented caching strategies that improved application response time by 45% and reduced infrastructure costs by $50K annually</div>
                    </div>
                  </div>
                  <div className="space-y-0.5 pt-0.5">
                    <div className="font-medium text-foreground text-[5px]">Software Engineer</div>
                    <div className="text-foreground/60 text-[4.5px]">StartUp Inc, New York, NY</div>
                    <div className="text-foreground/60 italic text-[4.5px]">June 2018 - December 2019</div>
                    <div className="flex gap-1 items-start">
                      <div className="text-foreground/60 text-[4.5px]">•</div>
                      <div className="text-foreground/60 leading-tight flex-1 text-[4.5px]">Developed RESTful APIs and responsive web interfaces using React and Python Django framework, serving 500K+ users and handling 10M+ API requests daily</div>
                    </div>
                    <div className="flex gap-1 items-start">
                      <div className="text-foreground/60 text-[4.5px]">•</div>
                      <div className="text-foreground/60 leading-tight flex-1 text-[4.5px]">Implemented comprehensive CI/CD pipelines with Jenkins and Docker, reducing deployment time from 2 hours to 15 minutes and enabling daily production releases</div>
                    </div>
                    <div className="flex gap-1 items-start">
                      <div className="text-foreground/60 text-[4.5px]">•</div>
                      <div className="text-foreground/60 leading-tight flex-1 text-[4.5px]">Collaborated with product and design teams to build customer-facing features that increased user engagement by 30% and contributed to $2M revenue growth</div>
                    </div>
                  </div>
                </div>

                {/* Skills - LEFT ALIGNED */}
                <div className="space-y-0.5 text-left">
                  <div className="font-semibold text-foreground border-b border-foreground/30 pb-0.5 text-[5.5px]">SKILLS</div>
                  <div className="text-foreground/60 text-[4.5px]"><span className="font-medium text-foreground">Languages:</span> Python, JavaScript, TypeScript, Java, Go</div>
                  <div className="text-foreground/60 text-[4.5px]"><span className="font-medium text-foreground">Technologies:</span> React, Node.js, AWS, Docker, Kubernetes</div>
                  <div className="text-foreground/60 text-[4.5px]"><span className="font-medium text-foreground">Databases:</span> PostgreSQL, MongoDB, Redis</div>
                </div>

                {/* Education - LEFT ALIGNED */}
                <div className="space-y-0.5 text-left">
                  <div className="font-semibold text-foreground border-b border-foreground/30 pb-0.5 text-[5.5px]">EDUCATION</div>
                  <div className="font-medium text-foreground text-[4.5px]">Bachelor of Science in Computer Science</div>
                  <div className="text-foreground/60 text-[4.5px]">University of Technology</div>
                  <div className="text-foreground/60 italic text-[4.5px]">Graduated: May 2018 • GPA: 3.8/4.0</div>
                </div>

                {/* Certifications - LEFT ALIGNED */}
                <div className="space-y-0.5 text-left">
                  <div className="font-semibold text-foreground border-b border-foreground/30 pb-0.5 text-[5.5px]">CERTIFICATIONS</div>
                  <div className="font-medium text-foreground text-[4.5px]">AWS Certified Solutions Architect</div>
                  <div className="text-foreground/60 text-[4.5px]">Amazon Web Services • 2022</div>
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
                <div className="h-[12%] bg-foreground/90 flex items-center justify-center border-b border-foreground">
                  <div className="space-y-0.5 text-center">
                    <div className="font-bold text-white text-[10px]">JOHN DOE</div>
                    <div className="text-white/80 text-[5px]">SOFTWARE ENGINEER</div>
                  </div>
                </div>

                <div className="flex flex-1">
                  {/* Light Sidebar with right-aligned text */}
                  <div className="w-[33%] bg-gray-100 p-2 space-y-1.5 flex flex-col items-end pr-1.5">
                    {/* Contact */}
                    <div className="space-y-0.5 text-right w-full">
                      <div className="font-semibold text-foreground text-[4.5px]">CONTACT</div>
                      <div className="h-px w-10 bg-foreground/30 ml-auto" />
                      <div className="text-foreground/60 text-[4px] leading-tight">john.doe@email.com</div>
                      <div className="text-foreground/60 text-[4px] leading-tight">(555) 123-4567</div>
                      <div className="text-foreground/60 text-[4px] leading-tight">New York, NY</div>
                      <div className="text-blue-600 text-[4px] leading-tight">linkedin.com/in/johndoe</div>
                      <div className="text-blue-600 text-[4px] leading-tight">github.com/johndoe</div>
                    </div>

                    {/* Education */}
                    <div className="space-y-0.5 text-right w-full pt-0.5">
                      <div className="font-semibold text-foreground text-[4.5px]">EDUCATION</div>
                      <div className="h-px w-10 bg-foreground/30 ml-auto" />
                      <div className="font-medium text-foreground text-[4px] leading-tight">Bachelor of Science in Computer Science</div>
                      <div className="text-foreground/60 text-[4px] leading-tight">University of Technology</div>
                      <div className="text-foreground/60 text-[4px] leading-tight">2018</div>
                      <div className="text-foreground/60 text-[4px] leading-tight">San Francisco, CA</div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-0.5 text-right w-full pt-0.5">
                      <div className="font-semibold text-foreground text-[4.5px]">SKILLS</div>
                      <div className="h-px w-10 bg-foreground/30 ml-auto" />
                      <div className="font-medium text-foreground text-[4px] leading-tight">Languages</div>
                      <div className="text-foreground/60 text-[4px] leading-tight">Python, JavaScript, TypeScript, Java</div>
                      <div className="font-medium text-foreground text-[4px] leading-tight pt-0.5">Technologies</div>
                      <div className="text-foreground/60 text-[4px] leading-tight">React, Node.js, AWS, Docker</div>
                      <div className="font-medium text-foreground text-[4px] leading-tight pt-0.5">Databases</div>
                      <div className="text-foreground/60 text-[4px] leading-tight">PostgreSQL, MongoDB</div>
                    </div>
                  </div>

                  {/* Main Content - LEFT ALIGNED */}
                  <div className="flex-1 p-2 space-y-1.5 pl-1.5 text-left">
                    {/* Summary */}
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground text-[5px]">SUMMARY</div>
                      <div className="h-px w-full bg-foreground/40" />
                      <div className="text-foreground/60 text-[4px] leading-tight">Results-driven Senior Software Engineer with 7+ years of experience designing and implementing scalable, high-performance web applications. Proven track record of leading cross-functional teams, architecting microservices solutions, and delivering products that serve millions of users. Expertise in full-stack development, cloud infrastructure, and modern DevOps practices.</div>
                    </div>

                    {/* Experience */}
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground text-[5px]">WORK EXPERIENCE</div>
                      <div className="h-px w-full bg-foreground/40" />
                      <div className="space-y-0.5">
                        <div className="font-medium text-foreground text-[4.5px]">Senior Software Engineer</div>
                        <div className="flex justify-between items-baseline">
                          <div className="text-foreground/60 text-[4px]">Tech Corp, San Francisco</div>
                          <div className="text-foreground/60 italic text-[4px]">Jan 2020 - Present</div>
                        </div>
                        <div className="flex gap-0.5 items-start">
                          <div className="text-foreground/60 text-[4px] mt-0.5">•</div>
                          <div className="text-foreground/60 text-[4px] leading-tight flex-1">Led development of microservices architecture using Node.js and Docker, successfully migrating monolithic application to serve 2M+ daily active users</div>
                        </div>
                        <div className="flex gap-0.5 items-start">
                          <div className="text-foreground/60 text-[4px] mt-0.5">•</div>
                          <div className="text-foreground/60 text-[4px] leading-tight flex-1">Architected real-time data processing pipeline using Apache Kafka and Redis, reducing latency by 65% and improving user experience</div>
                        </div>
                        <div className="flex gap-0.5 items-start">
                          <div className="text-foreground/60 text-[4px] mt-0.5">•</div>
                          <div className="text-foreground/60 text-[4px] leading-tight flex-1">Mentored team of 5 junior developers through code reviews and technical workshops, resulting in 40% improvement in code quality</div>
                        </div>
                      </div>
                      <div className="space-y-0.5 pt-0.5">
                        <div className="font-medium text-foreground text-[4.5px]">Software Engineer</div>
                        <div className="flex justify-between items-baseline">
                          <div className="text-foreground/60 text-[4px]">StartUp Inc, New York</div>
                          <div className="text-foreground/60 italic text-[4px]">Jun 2018 - Dec 2019</div>
                        </div>
                        <div className="flex gap-0.5 items-start">
                          <div className="text-foreground/60 text-[4px] mt-0.5">•</div>
                          <div className="text-foreground/60 text-[4px] leading-tight flex-1">Developed RESTful APIs and responsive web interfaces using React and Django, serving 500K+ users and handling 10M+ daily requests</div>
                        </div>
                        <div className="flex gap-0.5 items-start">
                          <div className="text-foreground/60 text-[4px] mt-0.5">•</div>
                          <div className="text-foreground/60 text-[4px] leading-tight flex-1">Implemented CI/CD pipelines with Jenkins and Docker, reducing deployment time from 2 hours to 15 minutes</div>
                        </div>
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground text-[5px]">PROJECTS</div>
                      <div className="h-px w-full bg-foreground/40" />
                      <div className="font-medium text-foreground text-[4.5px]">E-Commerce Platform</div>
                      <div className="flex gap-0.5 items-start">
                        <div className="text-foreground/60 text-[4px] mt-0.5">•</div>
                        <div className="text-foreground/60 text-[4px] leading-tight flex-1">Built full-stack e-commerce platform with React, Node.js, and PostgreSQL serving 100K+ users with real-time inventory management</div>
                      </div>
                      <div className="flex gap-0.5 items-start">
                        <div className="text-foreground/60 text-[4px] mt-0.5">•</div>
                        <div className="text-foreground/60 text-[4px] leading-tight flex-1">Integrated payment processing with Stripe and implemented secure authentication with JWT and OAuth 2.0</div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground text-[5px]">CERTIFICATIONS</div>
                      <div className="h-px w-full bg-foreground/40" />
                      <div className="font-medium text-foreground text-[4.5px]">AWS Certified Solutions Architect - Professional</div>
                      <div className="text-foreground/60 text-[4px]">Amazon Web Services | 2022</div>
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
