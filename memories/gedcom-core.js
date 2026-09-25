((scope) => {
  'use strict';

  const EVENT_TAGS = new Map([
    ['BIRT', 'Birth'], ['DEAT', 'Death'], ['BURI', 'Burial'], ['CREM', 'Cremation'],
    ['BAPM', 'Baptism'], ['CHR', 'Christening'], ['ADOP', 'Adoption'], ['MARR', 'Marriage'],
    ['DIV', 'Divorce'], ['RESI', 'Residence'], ['OCCU', 'Occupation'], ['EDUC', 'Education'],
    ['EMIG', 'Emigration'], ['IMMI', 'Immigration'], ['NATU', 'Naturalization'], ['RETI', 'Retirement'],
    ['EVEN', 'Life event'], ['FACT', 'Fact']
  ]);
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const unique = values => [...new Set((values || []).filter(Boolean))];
  const children = (node, tag) => (node?.children || []).filter(child => child.tag === tag);
  const first = (node, tag) => children(node, tag)[0] || null;
  const values = (node, tag) => children(node, tag).map(child => clean(child.value)).filter(Boolean);

  function parseLine(raw, lineNumber) {
    const line = String(raw || '').replace(/^\uFEFF/, '').replace(/\r$/, '');
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (!match) return null;
    const level = Number(match[1]);
    if (!Number.isInteger(level) || level < 0 || level > 99) return null;
    let remainder = match[2].trim();
    let xref = '';
    if (remainder.startsWith('@')) {
      const end = remainder.indexOf('@', 1);
      if (end > 1) {
        xref = remainder.slice(0, end + 1);
        remainder = remainder.slice(end + 1).trim();
      }
    }
    const split = remainder.indexOf(' ');
    const tag = (split < 0 ? remainder : remainder.slice(0, split)).toUpperCase();
    const value = split < 0 ? '' : remainder.slice(split + 1).trim();
    if (!/^[A-Z0-9_]+$/.test(tag)) return null;
    return { level, xref, tag, value, children: [], lineNumber };
  }

  function buildRecords(text) {
    if (typeof text !== 'string') throw new Error('The GEDCOM content is not text.');
    if (text.length > 80 * 1024 * 1024) throw new Error('That GEDCOM is larger than Nova can safely inspect in this browser.');
    const lines = text.split(/\n/);
    if (lines.length > 750000) throw new Error('That GEDCOM contains too many lines for this browser import.');
    const records = [];
    const stack = [];
    let malformed = 0;
    for (let index = 0; index < lines.length; index += 1) {
      const node = parseLine(lines[index], index + 1);
      if (!node) {
        if (clean(lines[index])) malformed += 1;
        continue;
      }
      while (stack.length && stack[stack.length - 1].level >= node.level) stack.pop();
      if ((node.tag === 'CONT' || node.tag === 'CONC') && stack.length) {
        const parent = stack[stack.length - 1];
        parent.value += `${node.tag === 'CONT' ? '\n' : ''}${node.value}`;
        continue;
      }
      if (!stack.length) records.push(node);
      else stack[stack.length - 1].children.push(node);
      stack.push(node);
    }
    return { records, malformed };
  }

  function recordText(node, tag) {
    const item = first(node, tag);
    return clean(item?.value);
  }

  function parseName(record) {
    const nameNode = first(record, 'NAME');
    const raw = clean(nameNode?.value);
    const given = clean(recordText(nameNode, 'GIVN') || raw.split('/')[0]);
    const surnameMatch = raw.match(/\/([^/]+)\//);
    const surname = clean(recordText(nameNode, 'SURN') || surnameMatch?.[1]);
    const suffix = clean(recordText(nameNode, 'NSFX'));
    const prefix = clean(recordText(nameNode, 'NPFX'));
    const display = clean([prefix, given, surname, suffix].filter(Boolean).join(' ')) || raw.replaceAll('/', '').trim() || 'Unnamed person';
    return { display, given, surname, raw };
  }

  function noteText(node, noteRecords) {
    const out = [];
    for (const note of children(node, 'NOTE')) {
      const value = clean(note.value);
      const linked = noteRecords.get(value);
      out.push(clean(linked?.value || value));
    }
    return unique(out).filter(value => value && !/^@.+@$/.test(value));
  }

  function sourceRefs(node) {
    return unique(children(node, 'SOUR').map(source => clean(source.value))).filter(Boolean);
  }

  function parseEvent(node, noteRecords) {
    const type = EVENT_TAGS.get(node.tag) || clean(recordText(node, 'TYPE')) || node.tag;
    return {
      type,
      tag: node.tag,
      date: clean(recordText(node, 'DATE')),
      place: clean(recordText(node, 'PLAC')),
      description: clean(node.value && node.value !== 'Y' ? node.value : recordText(node, 'DESC')),
      notes: noteText(node, noteRecords),
      sourceRefs: sourceRefs(node)
    };
  }

  function yearOf(value) {
    const years = String(value || '').match(/(?:^|\D)(1[0-9]{3}|20[0-9]{2})(?:\D|$)/g);
    if (!years?.length) return null;
    const match = years[0].match(/1[0-9]{3}|20[0-9]{2}/);
    return match ? Number(match[0]) : null;
  }

  function parseGedcom(text) {
    const { records, malformed } = buildRecords(text);
    if (!records.some(record => record.tag === 'HEAD') || !records.some(record => record.tag === 'TRLR')) {
      throw new Error('This does not appear to be a complete GEDCOM file.');
    }
    const noteRecords = new Map(records.filter(record => record.tag === 'NOTE' && record.xref).map(record => [record.xref, record]));
    const sourceRecords = new Map();
    for (const record of records.filter(item => item.tag === 'SOUR' && item.xref)) {
      sourceRecords.set(record.xref, {
        id: record.xref,
        title: clean(recordText(record, 'TITL') || record.value || 'Untitled source'),
        author: clean(recordText(record, 'AUTH')),
        publication: clean(recordText(record, 'PUBL')),
        text: clean(recordText(record, 'TEXT')),
        repositoryRef: clean(recordText(record, 'REPO'))
      });
    }

    const people = new Map();
    for (const record of records.filter(item => item.tag === 'INDI' && item.xref)) {
      const name = parseName(record);
      const events = [];
      for (const child of record.children) if (EVENT_TAGS.has(child.tag)) events.push(parseEvent(child, noteRecords));
      people.set(record.xref, {
        id: record.xref,
        name: name.display,
        given: name.given,
        surname: name.surname,
        sex: clean(recordText(record, 'SEX')),
        events,
        notes: noteText(record, noteRecords),
        sourceRefs: sourceRefs(record),
        familyAsChild: values(record, 'FAMC'),
        familyAsSpouse: values(record, 'FAMS'),
        parentIds: [],
        spouseIds: [],
        childIds: []
      });
    }

    const families = new Map();
    for (const record of records.filter(item => item.tag === 'FAM' && item.xref)) {
      const events = [];
      for (const child of record.children) if (EVENT_TAGS.has(child.tag)) events.push(parseEvent(child, noteRecords));
      families.set(record.xref, {
        id: record.xref,
        partnerIds: unique([...values(record, 'HUSB'), ...values(record, 'WIFE'), ...values(record, 'PART')]),
        childIds: unique(values(record, 'CHIL')),
        events,
        notes: noteText(record, noteRecords),
        sourceRefs: sourceRefs(record)
      });
    }

    const warnings = [];
    for (const family of families.values()) {
      const missing = [...family.partnerIds, ...family.childIds].filter(id => !people.has(id));
      if (missing.length) warnings.push({ type: 'missing-reference', message: `${family.id} refers to ${missing.length} person record${missing.length === 1 ? '' : 's'} that were not found.` });
      for (const partnerId of family.partnerIds) {
        const partner = people.get(partnerId);
        if (!partner) continue;
        partner.spouseIds = unique([...partner.spouseIds, ...family.partnerIds.filter(id => id !== partnerId && people.has(id))]);
        partner.childIds = unique([...partner.childIds, ...family.childIds.filter(id => people.has(id))]);
      }
      for (const childId of family.childIds) {
        const child = people.get(childId);
        if (child) child.parentIds = unique([...child.parentIds, ...family.partnerIds.filter(id => people.has(id))]);
      }
    }

    const duplicateGroups = new Map();
    for (const person of people.values()) {
      const birth = person.events.find(event => event.tag === 'BIRT');
      const death = person.events.find(event => event.tag === 'DEAT');
      const birthYear = yearOf(birth?.date);
      const deathYear = yearOf(death?.date);
      person.birthYear = birthYear;
      person.deathYear = deathYear;
      if (birthYear && deathYear && deathYear < birthYear) warnings.push({ type: 'date-conflict', personId: person.id, message: `${person.name} has a death date earlier than the birth date.` });
      const duplicateKey = `${clean(person.name).toLowerCase()}|${birthYear || ''}`;
      if (person.name !== 'Unnamed person') duplicateGroups.set(duplicateKey, [...(duplicateGroups.get(duplicateKey) || []), person.id]);
    }
    for (const ids of duplicateGroups.values()) {
      if (ids.length > 1) warnings.push({ type: 'possible-duplicate', personIds: ids, message: `${people.get(ids[0])?.name || 'A person'} appears ${ids.length} times with the same birth year.` });
    }
    for (const child of people.values()) {
      if (!child.birthYear) continue;
      for (const parentId of child.parentIds) {
        const parent = people.get(parentId);
        if (!parent?.birthYear) continue;
        const age = child.birthYear - parent.birthYear;
        if (age < 12 || age > 80) warnings.push({ type: 'relationship-date-conflict', personIds: [parent.id, child.id], message: `${parent.name} would have been ${age} when ${child.name} was born. Review the dates or relationship.` });
      }
    }

    const sourceLinks = new Set();
    const places = new Set();
    for (const person of people.values()) {
      person.sourceRefs.forEach(ref => sourceLinks.add(ref));
      person.events.forEach(event => {
        if (event.place) places.add(event.place);
        event.sourceRefs.forEach(ref => sourceLinks.add(ref));
      });
    }
    for (const family of families.values()) {
      family.sourceRefs.forEach(ref => sourceLinks.add(ref));
      family.events.forEach(event => {
        if (event.place) places.add(event.place);
        event.sourceRefs.forEach(ref => sourceLinks.add(ref));
      });
    }
    const unresolvedSources = [...sourceLinks].filter(ref => /^@.+@$/.test(ref) && !sourceRecords.has(ref));
    if (unresolvedSources.length) warnings.push({ type: 'missing-source', message: `${unresolvedSources.length} cited source record${unresolvedSources.length === 1 ? ' was' : 's were'} not included.` });
    if (malformed) warnings.push({ type: 'malformed-lines', message: `${malformed} line${malformed === 1 ? '' : 's'} could not be interpreted and will be skipped.` });

    return {
      format: 'astralis-nova-family-constellation',
      version: 1,
      importedAt: new Date().toISOString(),
      people: [...people.values()],
      families: [...families.values()],
      sources: [...sourceRecords.values()],
      warnings,
      stats: { people: people.size, families: families.size, sources: sourceRecords.size, places: places.size, warnings: warnings.length }
    };
  }

  function lifeLabel(person) {
    const born = person?.birthYear || '?';
    const died = person?.deathYear || '';
    return died ? `${born}–${died}` : born !== '?' ? `b. ${born}` : 'dates unknown';
  }

  function brainEntries(graph, limit = 2500) {
    const people = new Map((graph?.people || []).map(person => [person.id, person]));
    const sources = new Map((graph?.sources || []).map(source => [source.id, source]));
    return [...people.values()].slice(0, limit).map(person => {
      const parents = person.parentIds.map(id => people.get(id)?.name).filter(Boolean);
      const spouses = person.spouseIds.map(id => people.get(id)?.name).filter(Boolean);
      const childrenNames = person.childIds.map(id => people.get(id)?.name).filter(Boolean);
      const eventText = person.events.map(event => `${event.type}${event.date ? ` ${event.date}` : ''}${event.place ? ` in ${event.place}` : ''}${event.description ? `: ${event.description}` : ''}`).join('. ');
      const relationships = [parents.length ? `Parents: ${parents.join(', ')}` : '', spouses.length ? `Partners: ${spouses.join(', ')}` : '', childrenNames.length ? `Children: ${childrenNames.join(', ')}` : ''].filter(Boolean).join('. ');
      const birth = person.events.find(event => event.tag === 'BIRT');
      const death = person.events.find(event => event.tag === 'DEAT');
      const summary = [lifeLabel(person), birth?.place ? `born in ${birth.place}` : '', death?.place ? `died in ${death.place}` : '', relationships].filter(Boolean).join(' · ');
      const places = unique(person.events.map(event => event.place).filter(Boolean));
      const sourceTitles = unique([...person.sourceRefs, ...person.events.flatMap(event => event.sourceRefs || [])].map(ref => sources.get(ref)?.title || (/^@.+@$/.test(ref) ? '' : ref)).filter(Boolean));
      return {
        id: `family-${person.id.replaceAll('@', '')}`,
        category: 'Family Tree',
        title: person.name,
        summary,
        story: clean([eventText, relationships, person.notes.join(' '), sourceTitles.length ? `Sources: ${sourceTitles.join(', ')}` : ''].filter(Boolean).join('. ')).slice(0, 6000),
        tags: unique([person.surname, ...places, ...parents, ...spouses, ...childrenNames, ...sourceTitles, 'family constellation', 'genealogy']).slice(0, 40),
        family: true,
        personId: person.id
      };
    });
  }

  scope.NovaGedcomCore = { parseGedcom, brainEntries, lifeLabel, yearOf };
})(typeof window !== 'undefined' ? window : globalThis);
