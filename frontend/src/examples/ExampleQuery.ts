/**
 * Returns mock search results for development/testing.
 * @param time - Delay in milliseconds before resolving.
 * @returns Promise resolving to mock rule data.
 */
export default async function ExampleQuery(time: number): Promise<any> {
  await new Promise((res) => setTimeout(res, time));
  return {
    rules: [
      {
        ruleNumber: '26-244',
        section: 'Installation of electrical equipment',
        subsection: 'Transformers',
        title: 'Transformers mounted on roofs (see Appendix B)',
        subRuleLabel: ['1)', '2)'],
        relevanceExplanation:
          'Specifies requirements for dielectric liquid-filled and non-propagating liquid transformers mounted on roofs, including vault location and separation from doors, windows, and vents.',
      },
      {
        ruleNumber: '26-246',
        section: 'Installation of electrical equipment',
        subsection: 'Transformers',
        title: 'Dry-core, open-ventilated-type transformers',
        subRuleLabel: ['1)', '2)', '3)', '4)', '5)'],
        relevanceExplanation:
          'Details mounting clearances for dry-core transformers related to air space and combustible materials, and installation height to avoid flooding.',
      },
      {
        ruleNumber: '30-1016',
        section: 'Installation of lighting equipment',
        subsection: 'Permanent outdoor floodlighting installations',
        title: 'Location of transformers',
        subRuleLabel: ['a)', 'b)', 'c)'],
        relevanceExplanation:
          'Specifies mounting conditions for transformers on poles or platforms, including height requirements and guarding for outdoor lighting installations.',
      },
      {
        ruleNumber: '26-242',
        section: 'Installation of electrical equipment',
        subsection: 'Transformers',
        title: 'Outdoor transformer and unit substation installations',
        subRuleLabel: ['1)', '2)', '2) a)', '2) b)', '2) c)', '2) d)'],
        relevanceExplanation:
          'Covers outdoor mounting requirements for transformers, including elevation, fencing, warning signs, and minimum distances from combustible surfaces and building openings.',
      },
    ],
    conclusion:
      'Transformers can be mounted on roofs, floors, poles, platforms, or outdoors with specific requirements for clearances, elevation, enclosures, and safety measures as outlined in Rules 26-244, 26-246, 30-1016, and 26-242.',
  };
}
