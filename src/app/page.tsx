import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
            Transform Your Training Sessions with{" "}
            <span className="text-slate-600">AI-Powered Q&A</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Collect, analyze, and prioritize student questions using AI. Focus
            on what matters most during your training sessions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started Free
              </Button>
            </Link>
          </div>
          <div className="pt-4">
            <p className="text-slate-500">
              Trusted by 500+ educators worldwide • 10x faster question handling
            </p>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Stop drowning in questions. Focus on what matters.
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            Our AI-powered platform helps educators and trainers manage student
            questions efficiently, allowing you to identify the most important
            queries and provide better, more targeted responses.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2">67%</div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Time Saved
              </h3>
              <p className="text-slate-600">
                Instructors report saving an average of 67% of their question
                management time
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2">4.8x</div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Increased Engagement
              </h3>
              <p className="text-slate-600">
                Students are 4.8 times more likely to participate when their
                questions are prioritized
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2">95%</div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Higher Satisfaction
              </h3>
              <p className="text-slate-600">
                Training sessions show 95% higher satisfaction when using
                AI-prioritized Q&A
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Loved by Educators and Trainers Worldwide
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold mr-4">
                    JD
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Jane Doe</h4>
                    <p className="text-sm text-slate-600">
                      Corporate Training Manager
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 italic">
                  "Q&A Helper has completely transformed our training sessions.
                  I can now focus on the real questions that matter instead of
                  getting bogged down in less important ones."
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold mr-4">
                    JS
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">John Smith</h4>
                    <p className="text-sm text-slate-600">
                      University Professor
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 italic">
                  "The AI categorization feature is a game-changer. It helps me
                  identify struggling students quickly and tailor my responses
                  to their specific needs."
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold mr-4">
                    MR
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Maria Rodriguez
                    </h4>
                    <p className="text-sm text-slate-600">
                      Online Course Creator
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 italic">
                  "Our students love the improved response times and better
                  answers. The AI draft answers save me hours of prep time each
                  week."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Create Session
              </h3>
              <p className="text-slate-600">
                Create a training session and get a unique shareable link for
                your students.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Students Ask
              </h3>
              <p className="text-slate-600">
                Students submit questions via the link. No login required,
                totally frictionless.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                AI Analyzes
              </h3>
              <p className="text-slate-600">
                AI categorizes questions as important, creative, confused, or
                basic with draft answers.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Additional Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            More Benefits for Educators
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  Prioritized Questions
                </h3>
                <p className="text-slate-600">
                  AI identifies the most important questions first, helping you
                  address critical concerns before moving to the basics.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  Student Insights
                </h3>
                <p className="text-slate-600">
                  Get detailed analytics on student engagement and identify
                  knowledge gaps before they become problems.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  Draft Responses
                </h3>
                <p className="text-slate-600">
                  AI-powered draft answers help you respond more quickly and
                  consistently to common questions.
                </p>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0 space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  Engagement Tracking
                </h3>
                <p className="text-slate-600">
                  Monitor participation levels and identify students who may be
                  struggling with the material.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-slate-900 text-white border-none">
          <CardContent className="py-16 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to streamline your training sessions?
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Join 500+ instructors who are using AI to focus on the questions
              that matter most.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6"
                >
                  Create Free Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-slate-200">
        <div className="text-center text-slate-600 text-sm">
          <p>&copy; 2025 Q&A Helper. Built for educators, by educators.</p>
        </div>
      </footer>
    </div>
  );
}
