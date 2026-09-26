"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "es";

const en = {
  nav: { check: "Check my pay", how: "How it works", demo: "See an example" },
  landing: {
    eyebrow: "California wage theft checker",
    title: "Your boss may owe you thousands. Find out in 60 seconds.",
    lede: "Enter the hours you worked and what you were paid. Clocked applies California wage law — minimum wage, overtime, breaks — and shows exactly what you're owed, line by line.",
    ctaPrimary: "Check my pay",
    ctaSecondary: "See an example",
    trust: "Free · No account · English and Spanish",
    statEyebrow: "The biggest theft in America",
    statTitle: "Employers take more from workers' paychecks than all robberies, burglaries and car thefts combined.",
    stats: [
      { value: "$15B", label: "lost every year to minimum wage violations alone" },
      { value: "17%", label: "of low-wage workers are paid below the minimum wage" },
      { value: "$3,300", label: "average yearly loss for a full-time worker who is cheated" },
    ],
    statSource: "Economic Policy Institute analysis of Current Population Survey data.",
    howEyebrow: "How it works",
    howTitle: "AI reads. The law decides.",
    how: [
      {
        title: "Tell us your week",
        body: "Tap your shifts on a calendar, or just describe them — “Mon–Sat, 8am to 8pm, no break.” In English or Spanish.",
      },
      {
        title: "The law does the math",
        body: "Minimum wage for your city, daily and weekly overtime, double time, missed breaks. Every number cites the California Labor Code.",
      },
      {
        title: "Get a claim-ready summary",
        body: "See what you're owed this week and over time, then take a clear summary to a free Labor Commissioner claim.",
      },
    ],
    principleEyebrow: "Built to be trusted",
    principles: [
      { title: "No guessing", body: "The AI only helps turn your words into shifts. Every dollar comes from rules written straight from the statute, with 30+ automated tests." },
      { title: "Every line is cited", body: "Each amount links to the exact law behind it, so a clerk, a lawyer or a judge can check it." },
      { title: "Your status doesn't matter", body: "California wage protections apply to every worker, regardless of immigration status (Lab. Code §1171.5)." },
    ],
    finalTitle: "It isn't a bad job. It might be theft.",
    finalBody: "Check one week. It takes about a minute.",
    footer: "Clocked provides legal information, not legal advice. Rates verified September 2026.",
  },
  check: {
    back: "Back",
    next: "Continue",
    steps: ["Where", "Your week", "Your pay", "Result", "Claim"],
    where: {
      title: "Where do you work?",
      body: "Some cities set a higher minimum wage than the state.",
      perHour: "/ hour minimum",
      elsewhere: "Elsewhere in California",
    },
    week: {
      title: "What did you work this week?",
      body: "Tap a day to add a shift, or describe your week in your own words.",
      describe: "Describe your week",
      describePlaceholder: "Mon–Sat, 8am to 8pm, no break",
      describeHint: "Try: “lunes a sábado de 8 a 8, sin descanso”",
      fill: "Fill my week",
      reading: "Reading…",
      notUnderstood: "We couldn't read that. Try days and times, like “Mon–Fri 9am–5pm”.",
      readBy: (n: number) => `Added ${n} ${n === 1 ? "shift" : "shifts"}. Check them below.`,
      addShift: "Add shift",
      start: "Start",
      end: "End",
      breakLabel: "Unpaid break",
      noBreak: "None",
      remove: "Remove",
      totalHours: (h: string, d: number) => `${h} hours · ${d} ${d === 1 ? "day" : "days"}`,
      empty: "No shifts yet",
      mealQ: "Unpaid meal break each day",
      mealOptions: ["None", "30 min", "1 hour"],
      readInstant: "Read instantly",
      readAi: "Read by AI",
      selectHint: "Tap a shift to change its hours.",
      restQ: "Did you get your 10-minute rest breaks?",
      yes: "Yes",
      no: "No",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      daysLong: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    pay: {
      title: "What were you paid for this week?",
      body: "Use the amount you actually received, before any tips.",
      flat: "Flat amount",
      flatHint: "Cash or check, the same each week",
      hourly: "By the hour",
      hourlyHint: "A set rate for each hour",
      amount: "Amount received",
      rate: "Hourly rate",
      received: "Total you received (optional)",
      receivedHint: (v: string) => `If left blank we assume ${v}: your rate for every hour, with no overtime.`,
      see: "See what I'm owed",
    },
    result: {
      eyebrow: "Underpaid this week",
      evenEyebrow: "This week",
      evenTitle: "Your pay meets California law for this week.",
      summary: (paid: string, h: string, rate: string) => `You were paid ${paid} for ${h} hours — that's ${rate} an hour.`,
      minimum: (city: string, min: string) => `The minimum wage in ${city} is ${min} an hour.`,
      required: "What the law required",
      requiredBody: "Built from your hours. Every line links to the law behind it.",
      paidLine: "What you were paid",
      gap: "Owed to you",
      findings: "What went wrong",
      checksTitle: "What we checked",
      checks: ["Minimum wage", "Daily and weekly overtime", "Double time", "Meal breaks", "Rest breaks"],
      another: "Check another week",
      zoomEyebrow: "Over time",
      zoomTitle: "If every week looked like this",
      zoomNote: "California lets you claim unpaid wages going back up to 3 years.",
      weeks: (n: number) => `${n} ${n === 1 ? "week" : "weeks"}`,
      presets: [
        { label: "1 week", weeks: 1 },
        { label: "1 month", weeks: 4 },
        { label: "6 months", weeks: 26 },
        { label: "1 year", weeks: 52 },
        { label: "3 years", weeks: 156 },
      ],
      liquidated: (v: string) => `A court can add up to ${v} more for this week, because pay fell below minimum wage.`,
      cta: "Get my claim summary",
      edit: "Edit my week",
      lines: {
        regular: "Regular hours",
        overtime: "Overtime · 1.5×",
        doubleTime: "Double time · 2×",
        mealPremium: "Missed meal breaks",
        restPremium: "Missed rest breaks",
      },
      unitHours: "h",
      unitDays: (n: number): string => (n === 1 ? "day" : "days"),
      finding: {
        "below-minimum-wage": (v: Record<string, string>) =>
          `You earned ${v.effectiveRate} an hour. The legal minimum here is ${v.minimumWage}.`,
        "unpaid-overtime": (v: Record<string, string>) =>
          `${v.hours} of your hours were overtime. The law requires ${v.rate} an hour for them.`,
        "unpaid-double-time": (v: Record<string, string>) =>
          `${v.hours} of your hours were double time: ${v.rate} an hour.`,
        "missed-meal-periods": (v: Record<string, string>) =>
          `On ${v.days} days you worked over 5 hours without a 30-minute meal break. Each one earns an extra hour of pay.`,
        "missed-rest-breaks": (v: Record<string, string>) =>
          `On ${v.days} days you didn't get rest breaks. Each one earns an extra hour of pay.`,
      },
    },
    claim: {
      eyebrow: "Wage claim summary",
      title: "Your claim summary",
      body: "Bring this to a free Labor Commissioner claim, or to a legal aid clinic.",
      worker: "Your name",
      employer: "Employer name",
      optional: "Optional",
      period: "Pay period",
      weekOf: "One typical week",
      location: "Work location",
      hoursWorked: "Hours worked",
      schedule: "Schedule",
      amounts: "Amounts",
      violations: "Violations found",
      total: "Unpaid this week",
      overTime: (w: string) => `If this happened for ${w}`,
      next: "What to do next",
      steps: [
        { title: "File a free wage claim", body: "With the California Labor Commissioner. No lawyer needed, and it costs nothing." },
        { title: "Gather proof", body: "Texts about your schedule, photos of your hours, pay envelopes, bank deposits, co-workers who saw you working." },
        { title: "Know your protections", body: "Your employer can't fire, threaten or report you for claiming your wages (Lab. Code §98.6). Your immigration status doesn't matter (Lab. Code §1171.5)." },
      ],
      file: "File with the Labor Commissioner",
      legalAid: "Find free legal aid",
      print: "Print or save as PDF",
      disclaimer: "Legal information, not legal advice. Calculated with California Labor Code rules and 2026 minimum wage rates.",
      startOver: "Start over",
    },
  },
  lang: { label: "Español", short: "ES" },
};

export type Dictionary = typeof en;

const es: Dictionary = {
  nav: { check: "Revisar mi pago", how: "Cómo funciona", demo: "Ver un ejemplo" },
  landing: {
    eyebrow: "Detector de robo de salarios en California",
    title: "Tu jefe podría deberte miles. Descúbrelo en 60 segundos.",
    lede: "Ingresa las horas que trabajaste y lo que te pagaron. Clocked aplica la ley salarial de California — salario mínimo, horas extra, descansos — y te muestra exactamente lo que te deben, línea por línea.",
    ctaPrimary: "Revisar mi pago",
    ctaSecondary: "Ver un ejemplo",
    trust: "Gratis · Sin cuenta · En inglés y español",
    statEyebrow: "El robo más grande de Estados Unidos",
    statTitle: "Los empleadores les quitan más a los trabajadores que todos los asaltos, robos a casas y robos de autos juntos.",
    stats: [
      { value: "$15 mil mill.", label: "perdidos cada año solo por violaciones del salario mínimo" },
      { value: "17%", label: "de los trabajadores de bajos ingresos ganan menos del mínimo" },
      { value: "$3,300", label: "pérdida anual promedio de un trabajador de tiempo completo" },
    ],
    statSource: "Análisis del Economic Policy Institute con datos de la Current Population Survey.",
    howEyebrow: "Cómo funciona",
    howTitle: "La IA lee. La ley decide.",
    how: [
      {
        title: "Cuéntanos tu semana",
        body: "Marca tus turnos en el calendario, o descríbelos — “lunes a sábado de 8 a 8, sin descanso.” En español o inglés.",
      },
      {
        title: "La ley hace las cuentas",
        body: "Salario mínimo de tu ciudad, horas extra diarias y semanales, tiempo doble, descansos perdidos. Cada número cita el Código Laboral de California.",
      },
      {
        title: "Recibe un resumen para tu reclamo",
        body: "Ve lo que te deben esta semana y con el tiempo, y lleva un resumen claro a un reclamo gratuito ante el Comisionado Laboral.",
      },
    ],
    principleEyebrow: "Hecho para ser confiable",
    principles: [
      { title: "Sin adivinar", body: "La IA solo convierte tus palabras en turnos. Cada dólar sale de reglas escritas directamente de la ley, con más de 30 pruebas automáticas." },
      { title: "Cada línea tiene su ley", body: "Cada cantidad enlaza a la ley exacta, para que un empleado de la corte, un abogado o un juez la pueda revisar." },
      { title: "Tu estatus no importa", body: "Las protecciones salariales de California aplican a todos, sin importar el estatus migratorio (Código Laboral §1171.5)." },
    ],
    finalTitle: "No es un mal trabajo. Podría ser un robo.",
    finalBody: "Revisa una semana. Toma como un minuto.",
    footer: "Clocked ofrece información legal, no asesoría legal. Tarifas verificadas en septiembre de 2026.",
  },
  check: {
    back: "Atrás",
    next: "Continuar",
    steps: ["Dónde", "Tu semana", "Tu pago", "Resultado", "Reclamo"],
    where: {
      title: "¿Dónde trabajas?",
      body: "Algunas ciudades tienen un salario mínimo más alto que el del estado.",
      perHour: "/ hora mínimo",
      elsewhere: "Otra parte de California",
    },
    week: {
      title: "¿Qué trabajaste esta semana?",
      body: "Toca un día para agregar un turno, o describe tu semana con tus palabras.",
      describe: "Describe tu semana",
      describePlaceholder: "lunes a sábado de 8 a 8, sin descanso",
      describeHint: "Prueba: “Mon–Sat, 8am to 8pm, no break”",
      fill: "Llenar mi semana",
      reading: "Leyendo…",
      notUnderstood: "No pudimos leer eso. Prueba con días y horas, como “lunes a viernes de 9 a 5”.",
      readBy: (n: number) => `Agregamos ${n} ${n === 1 ? "turno" : "turnos"}. Revísalos abajo.`,
      addShift: "Agregar turno",
      start: "Entrada",
      end: "Salida",
      breakLabel: "Descanso sin pago",
      noBreak: "Ninguno",
      remove: "Quitar",
      totalHours: (h: string, d: number) => `${h} horas · ${d} ${d === 1 ? "día" : "días"}`,
      empty: "Aún no hay turnos",
      mealQ: "Descanso para comer cada día (sin pago)",
      mealOptions: ["Ninguno", "30 min", "1 hora"],
      readInstant: "Leído al instante",
      readAi: "Leído por IA",
      selectHint: "Toca un turno para cambiar sus horas.",
      restQ: "¿Tuviste descansos de 10 minutos?",
      yes: "Sí",
      no: "No",
      days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      daysLong: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    },
    pay: {
      title: "¿Cuánto te pagaron por esta semana?",
      body: "Usa la cantidad que realmente recibiste, sin contar propinas.",
      flat: "Cantidad fija",
      flatHint: "En efectivo o cheque, igual cada semana",
      hourly: "Por hora",
      hourlyHint: "Una tarifa por cada hora",
      amount: "Cantidad recibida",
      rate: "Pago por hora",
      received: "Total que recibiste (opcional)",
      receivedHint: (v: string) => `Si lo dejas vacío, suponemos ${v}: tu tarifa por cada hora, sin horas extra.`,
      see: "Ver lo que me deben",
    },
    result: {
      eyebrow: "Te pagaron de menos esta semana",
      evenEyebrow: "Esta semana",
      evenTitle: "Tu pago cumple con la ley de California esta semana.",
      summary: (paid: string, h: string, rate: string) => `Te pagaron ${paid} por ${h} horas — eso es ${rate} por hora.`,
      minimum: (city: string, min: string) => `El salario mínimo en ${city} es ${min} por hora.`,
      required: "Lo que exige la ley",
      requiredBody: "Calculado con tus horas. Cada línea enlaza a la ley que la respalda.",
      paidLine: "Lo que te pagaron",
      gap: "Te deben",
      findings: "Qué salió mal",
      checksTitle: "Lo que revisamos",
      checks: ["Salario mínimo", "Horas extra diarias y semanales", "Tiempo doble", "Descansos para comer", "Descansos de 10 minutos"],
      another: "Revisar otra semana",
      zoomEyebrow: "Con el tiempo",
      zoomTitle: "Si cada semana fue así",
      zoomNote: "En California puedes reclamar salarios no pagados de hasta 3 años atrás.",
      weeks: (n: number) => `${n} ${n === 1 ? "semana" : "semanas"}`,
      presets: [
        { label: "1 semana", weeks: 1 },
        { label: "1 mes", weeks: 4 },
        { label: "6 meses", weeks: 26 },
        { label: "1 año", weeks: 52 },
        { label: "3 años", weeks: 156 },
      ],
      liquidated: (v: string) => `Un juez puede sumar hasta ${v} más por esta semana, porque el pago fue menor al salario mínimo.`,
      cta: "Ver mi resumen de reclamo",
      edit: "Editar mi semana",
      lines: {
        regular: "Horas normales",
        overtime: "Horas extra · 1.5×",
        doubleTime: "Tiempo doble · 2×",
        mealPremium: "Comidas sin descanso",
        restPremium: "Descansos no dados",
      },
      unitHours: "h",
      unitDays: (n: number) => (n === 1 ? "día" : "días"),
      finding: {
        "below-minimum-wage": (v: Record<string, string>) =>
          `Ganaste ${v.effectiveRate} por hora. El mínimo legal aquí es ${v.minimumWage}.`,
        "unpaid-overtime": (v: Record<string, string>) =>
          `${v.hours} de tus horas fueron horas extra. La ley exige ${v.rate} por hora por ellas.`,
        "unpaid-double-time": (v: Record<string, string>) =>
          `${v.hours} de tus horas fueron tiempo doble: ${v.rate} por hora.`,
        "missed-meal-periods": (v: Record<string, string>) =>
          `En ${v.days} días trabajaste más de 5 horas sin 30 minutos para comer. Cada uno te da una hora extra de pago.`,
        "missed-rest-breaks": (v: Record<string, string>) =>
          `En ${v.days} días no tuviste descansos. Cada uno te da una hora extra de pago.`,
      },
    },
    claim: {
      eyebrow: "Resumen de reclamo salarial",
      title: "Tu resumen de reclamo",
      body: "Llévalo a un reclamo gratuito ante el Comisionado Laboral, o a una clínica de ayuda legal.",
      worker: "Tu nombre",
      employer: "Nombre del empleador",
      optional: "Opcional",
      period: "Periodo",
      weekOf: "Una semana típica",
      location: "Lugar de trabajo",
      hoursWorked: "Horas trabajadas",
      schedule: "Horario",
      amounts: "Cantidades",
      violations: "Violaciones encontradas",
      total: "No pagado esta semana",
      overTime: (w: string) => `Si esto pasó por ${w}`,
      next: "Qué hacer ahora",
      steps: [
        { title: "Presenta un reclamo gratuito", body: "Ante el Comisionado Laboral de California. No necesitas abogado y no cuesta nada." },
        { title: "Junta pruebas", body: "Mensajes sobre tu horario, fotos de tus horas, sobres de pago, depósitos, compañeros que te vieron trabajar." },
        { title: "Conoce tus protecciones", body: "Tu empleador no puede despedirte, amenazarte ni reportarte por reclamar tu salario (Código Laboral §98.6). Tu estatus migratorio no importa (Código Laboral §1171.5)." },
      ],
      file: "Presentar ante el Comisionado Laboral",
      legalAid: "Buscar ayuda legal gratuita",
      print: "Imprimir o guardar como PDF",
      disclaimer: "Información legal, no asesoría legal. Calculado con las reglas del Código Laboral de California y los salarios mínimos de 2026.",
      startOver: "Empezar de nuevo",
    },
  },
  lang: { label: "English", short: "EN" },
};

const dictionaries: Record<Lang, Dictionary> = { en, es };

type I18nValue = { lang: Lang; t: Dictionary; setLang: (lang: Lang) => void; toggle: () => void };

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = "clocked.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const fromUrl = new URLSearchParams(window.location.search).get("lang");
      const next = fromUrl === "es" || fromUrl === "en" ? fromUrl : stored === "es" ? "es" : null;
      // Restoring a saved preference after hydration; the server render is always English.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (next) setLangState(next);
    } catch {
      /* storage unavailable: keep English */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({ lang, t: dictionaries[lang], setLang, toggle: () => setLang(lang === "en" ? "es" : "en") }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
