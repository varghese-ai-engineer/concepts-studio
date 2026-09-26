'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, CreditCard, ShieldCheck, Zap, Loader2 } from 'lucide-react';

export interface PricingPlanDetails {
  id: string;
  code: string;
  name: string;
  description: string;
  billing_interval: string;
  price: number;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  symbol: string;
  entitlements: Record<string, any>;
  features: string[];
  sort_order?: number;
}

const PLAN_META: Record<string, { icon: any; color: string }> = {
  starter:      { icon: Sparkles,   color: 'from-blue-500 to-indigo-600' },
  professional: { icon: ShieldCheck, color: 'from-purple-500 to-violet-600' },
  enterprise:   { icon: CreditCard,  color: 'from-amber-500 to-orange-600' },
  agency:       { icon: Zap,         color: 'from-rose-500 to-pink-600' },
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ', SGD: 'S$', CAD: 'CA$', AUD: 'A$',
};

export function getCurrencySymbol(currency: string) {
  return CURRENCY_SYMBOLS[currency] ?? currency + ' ';
}

export interface PlanDiscount {
  discountedPrice: number;
  discountAmount: number;
  label: string;
}

interface PricingPlansGridProps {
  plans: PricingPlanDetails[];
  billingInterval: 'monthly' | 'yearly';
  /** Code of the plan the current viewer is already subscribed to (billing page only). */
  activePlanCode?: string;
  /** Label for the primary CTA button on non-active cards. Defaults to "Subscribe". */
  ctaLabel?: string;
  /** Label shown (and button disabled) on the card matching activePlanCode. Defaults to "Current Plan". */
  activeCtaLabel?: string;
  /** Plan code currently mid-action (shows a spinner on that card's button). */
  actionLoadingCode?: string | null;
  onPlanAction: (plan: PricingPlanDetails) => void;
  /** Optional coupon/discount calculation — billing page only. Landing page omits this entirely. */
  getDiscount?: (plan: PricingPlanDetails) => PlanDiscount | null;
}

export function PricingPlansGrid({
  plans,
  billingInterval,
  activePlanCode,
  ctaLabel = 'Subscribe',
  activeCtaLabel = 'Current Plan',
  actionLoadingCode = null,
  onPlanAction,
  getDiscount,
}: PricingPlansGridProps) {
  const intervalPlans = plans.filter((p) => p.code !== 'free');
  const sortedPlans = [...intervalPlans].sort((a, b) => {
    // If it's free trial, keep it first
    if (a.code === 'free_trial') return -1;
    if (b.code === 'free_trial') return 1;
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (sortedPlans.length > 0 && !selectedPlanId) {
      const initial = sortedPlans.find(p => p.code.replace('_monthly', '').replace('_yearly', '') === activePlanCode) || sortedPlans[0];
      setSelectedPlanId(initial.id);
    }
  }, [sortedPlans, activePlanCode, selectedPlanId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (sortedPlans.length === 0) return;
    const currentIndex = sortedPlans.findIndex(p => p.id === selectedPlanId);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % sortedPlans.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + sortedPlans.length) % sortedPlans.length;
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      const selectedPlan = sortedPlans[currentIndex];
      if (selectedPlan && selectedPlan.code.replace('_monthly', '').replace('_yearly', '') !== activePlanCode) {
        onPlanAction(selectedPlan);
      }
      e.preventDefault();
    }

    if (nextIndex !== currentIndex) {
      setSelectedPlanId(sortedPlans[nextIndex].id);
      const cardEl = document.getElementById(`plan-card-${sortedPlans[nextIndex].id}`);
      cardEl?.focus();
    }
  };

  return (
    <div 
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 outline-none"
      onKeyDown={handleKeyDown}
    >
      {sortedPlans.map((plan) => {
        const baseCode = plan.code.replace('_monthly', '').replace('_yearly', '');
        const meta = PLAN_META[baseCode] || {
          icon: CreditCard,
          color: 'from-gray-500 to-slate-600',
        };
        const isActive = activePlanCode
          ? activePlanCode === baseCode
          : false;

        const isSelected = selectedPlanId === plan.id;

        const discount = (getDiscount && isSelected) ? getDiscount(plan) : null;
        const currentPrice = billingInterval === 'yearly' ? (plan.yearly_price / 12) : plan.monthly_price;
        const discountedPrice = discount
          ? (billingInterval === 'yearly' ? discount.discountedPrice / 12 : discount.discountedPrice)
          : currentPrice;
        const discountAmount = discount ? discount.discountAmount : 0;

        const formattedPrice = currentPrice.toLocaleString(undefined, {
          minimumFractionDigits: currentPrice % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        });
        const formattedDiscountedPrice = discountedPrice.toLocaleString(undefined, {
          minimumFractionDigits: discountedPrice % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        });
        const currencySymbol = plan.symbol || getCurrencySymbol(plan.currency || 'USD');

        return (
          <Card
            id={`plan-card-${plan.id}`}
            key={plan.id}
            tabIndex={0}
            onClick={() => setSelectedPlanId(plan.id)}
            onFocus={() => setSelectedPlanId(plan.id)}
            className={`shadow-sm border relative overflow-hidden flex flex-col justify-between transition-all duration-200 outline-none cursor-pointer hover:shadow-md ${
              isSelected
                ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-600/30 dark:ring-blue-400/30 scale-[1.02] z-10'
                : isActive
                ? 'border-gray-300 dark:border-gray-700 bg-gray-50/50 opacity-95'
                : 'border-gray-150 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
              <div>
                <div className={`h-1.5 w-full bg-gradient-to-r ${meta.color}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </CardTitle>
                    <meta.icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <CardDescription className="text-xs h-10">{plan.description}</CardDescription>
                  <div className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                    {discount && discountAmount > 0 ? (
                      <>
                        <span className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                          {currencySymbol}
                          {formattedDiscountedPrice}
                        </span>
                        <span className="ml-2 text-lg font-medium text-gray-400 line-through">
                          {currencySymbol}
                          {formattedPrice}
                        </span>
                      </>
                    ) : billingInterval === 'yearly' && plan.monthly_price > currentPrice ? (
                      <>
                        <span className="text-4xl font-extrabold tracking-tight">
                          {currencySymbol}
                          {formattedPrice}
                        </span>
                        <span className="ml-2 text-lg font-medium text-gray-400 line-through">
                          {currencySymbol}
                          {plan.monthly_price.toLocaleString(undefined, {
                            minimumFractionDigits: plan.monthly_price % 1 === 0 ? 0 : 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-extrabold tracking-tight">
                        {currencySymbol}
                        {formattedPrice}
                      </span>
                    )}
                    <span className="ml-1 text-sm font-semibold text-gray-500">
                      /mo
                    </span>
                  </div>
                  {billingInterval === 'yearly' && plan.yearly_price > 0 && (
                    <span className="text-[10px] font-semibold text-green-600 mt-1 block">
                      Billed yearly ({currencySymbol}{plan.yearly_price.toLocaleString()})
                    </span>
                  )}
                  {discount && discountAmount > 0 && (
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 mt-1 block">
                      {discount.label}
                    </span>
                  )}
                </CardHeader>
                <CardContent className="pb-6">
                  <ul className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
                    {(plan.features || []).map((f, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
              <CardFooter className="pt-0 pb-6">
                <Button
                  onClick={() => onPlanAction(plan)}
                  disabled={isActive || actionLoadingCode !== null || !isSelected}
                  className={`w-full font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-600'
                      : !isSelected
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 dark:bg-gray-900 dark:text-gray-600'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {actionLoadingCode === plan.code ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : isActive ? (
                    activeCtaLabel
                  ) : (
                    ctaLabel
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
  );
}
