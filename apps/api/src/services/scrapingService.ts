/**
 * Scraping Service
 * 
 * STRICT: Service for fetching and parsing HTML content from real estate websites.
 * Used by the No-Code Integration Builder.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SelectorTestResult {
    found: boolean;
    count: number;
    samples: string[];
    error?: string;
}

export interface FieldExtraction {
    field: string;
    selector: string;
    value: string | string[] | null;
    error?: string;
}

export interface PagePreview {
    url: string;
    title: string;
    success: boolean;
    extractions: FieldExtraction[];
    rawHtml?: string;
    error?: string;
}

export interface TransformConfig {
    type: 'trim' | 'extractNumber' | 'extractCurrency' | 'resolveUrl' | 'regex' | 'replace' | 'default';
    options?: Record<string, any>;
}

export interface FieldMapping {
    field: string;
    selector: string;
    attribute?: string; // 'text' | 'href' | 'src' | custom attribute
    multiple?: boolean;
    transforms?: TransformConfig[];
}

export interface IScrapingService {
    fetchPage(url: string): Promise<{ html: string; status: number }>;
    testSelector(html: string, selector: string): SelectorTestResult;
    extractField(html: string, mapping: FieldMapping, baseUrl: string): FieldExtraction;
    previewExtraction(url: string, fieldMappings: FieldMapping[]): Promise<PagePreview>;
    applyTransforms(value: string, transforms: TransformConfig[], baseUrl: string): string;
}

export class ScrapingService implements IScrapingService {
    private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    private readonly timeout = 30000;

    async fetchPage(url: string): Promise<{ html: string; status: number }> {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
                },
                timeout: this.timeout,
                maxRedirects: 5,
            });

            return {
                html: response.data,
                status: response.status,
            };
        } catch (error: any) {
            throw new Error(`Failed to fetch page: ${error.message}`);
        }
    }

    testSelector(html: string, selector: string): SelectorTestResult {
        try {
            const $ = cheerio.load(html);
            const elements = $(selector);
            const count = elements.length;

            if (count === 0) {
                return {
                    found: false,
                    count: 0,
                    samples: [],
                };
            }

            const samples: string[] = [];
            elements.slice(0, 5).each((_, el) => {
                const text = $(el).text().trim().substring(0, 200);
                if (text) samples.push(text);
            });

            return {
                found: true,
                count,
                samples,
            };
        } catch (error: any) {
            return {
                found: false,
                count: 0,
                samples: [],
                error: `Invalid selector: ${error.message}`,
            };
        }
    }

    extractField(html: string, mapping: FieldMapping, baseUrl: string): FieldExtraction {
        try {
            const $ = cheerio.load(html);
            const elements = $(mapping.selector);

            if (elements.length === 0) {
                return {
                    field: mapping.field,
                    selector: mapping.selector,
                    value: null,
                    error: 'No elements found',
                };
            }

            const getValue = (el: any): string => {
                const $el = $(el);
                if (mapping.attribute === 'text' || !mapping.attribute) {
                    return $el.text().trim();
                } else if (mapping.attribute === 'html') {
                    return $el.html() || '';
                } else {
                    return $el.attr(mapping.attribute) || '';
                }
            };

            let value: string | string[];

            if (mapping.multiple) {
                value = [];
                elements.each((_, el) => {
                    let v = getValue(el);
                    if (mapping.transforms) {
                        v = this.applyTransforms(v, mapping.transforms, baseUrl);
                    }
                    if (v) (value as string[]).push(v);
                });
            } else {
                value = getValue(elements.first().get(0));
                if (mapping.transforms) {
                    value = this.applyTransforms(value, mapping.transforms, baseUrl);
                }
            }

            return {
                field: mapping.field,
                selector: mapping.selector,
                value,
            };
        } catch (error: any) {
            return {
                field: mapping.field,
                selector: mapping.selector,
                value: null,
                error: error.message,
            };
        }
    }

    async previewExtraction(url: string, fieldMappings: FieldMapping[]): Promise<PagePreview> {
        try {
            const { html } = await this.fetchPage(url);
            const $ = cheerio.load(html);
            const title = $('title').text().trim() || 'Untitled';

            const extractions = fieldMappings.map(mapping =>
                this.extractField(html, mapping, url)
            );

            return {
                url,
                title,
                success: true,
                extractions,
            };
        } catch (error: any) {
            return {
                url,
                title: '',
                success: false,
                extractions: [],
                error: error.message,
            };
        }
    }

    applyTransforms(value: string, transforms: TransformConfig[], baseUrl: string): string {
        let result = value;

        for (const transform of transforms) {
            switch (transform.type) {
                case 'trim':
                    result = result.trim();
                    break;

                case 'extractNumber':
                    const numbers = result.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
                    result = parseFloat(numbers).toString() || result;
                    break;

                case 'extractCurrency':
                    if (result.includes('EUR') || result.includes('€')) {
                        result = 'EUR';
                    } else if (result.includes('RON') || result.includes('lei')) {
                        result = 'RON';
                    } else if (result.includes('USD') || result.includes('$')) {
                        result = 'USD';
                    }
                    break;

                case 'resolveUrl':
                    if (result && !result.startsWith('http')) {
                        try {
                            result = new URL(result, baseUrl).href;
                        } catch {
                            // Keep original if URL resolution fails
                        }
                    }
                    break;

                case 'regex':
                    if (transform.options?.pattern) {
                        const regex = new RegExp(transform.options.pattern);
                        const match = result.match(regex);
                        if (match) {
                            result = match[transform.options.group || 0] || result;
                        }
                    }
                    break;

                case 'replace':
                    if (transform.options?.find) {
                        result = result.replace(
                            new RegExp(transform.options.find, 'g'),
                            transform.options.replace || ''
                        );
                    }
                    break;

                case 'default':
                    if (!result && transform.options?.value) {
                        result = transform.options.value;
                    }
                    break;
            }
        }

        return result;
    }
}
